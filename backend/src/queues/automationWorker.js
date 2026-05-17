import { Worker } from "bullmq";
import Redis from "ioredis";

import connection from "../redis.js";
import { executeAutomationService } from "../services/automationService.js";

const ensureRedisConnection = async () => {
  const probeConnection = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    retryStrategy: () => null,
  });

  probeConnection.on("error", () => {});

  try {
    await probeConnection.connect();
    await probeConnection.ping();
    await probeConnection.quit();
  } catch (error) {
    probeConnection.disconnect();
    console.error(
      "No se pudo conectar a Redis. Verifica que Redis esté activo en 127.0.0.1:6379 o configura REDIS_HOST/REDIS_PORT."
    );
    process.exit(1);
  }
};

await ensureRedisConnection();

const automationWorker = new Worker(
  "automationQueue",
  async (job) => {
    const { automationId, source } = job.data;

    console.log(`Procesando automatización ${automationId} (origen: ${source})`);

    await executeAutomationService(automationId);
  },
  {
    connection,
    concurrency: 5,
  }
);

automationWorker.on("error", (error) => {
  console.error("Worker Redis error:", error.message);
});

automationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completado`);
});

automationWorker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} falló`, error.message);
});
