import { Worker } from "bullmq";
import Redis from "ioredis";

import connection from "../redis.js";

import {
  executeWorkflow,
} from "../services/workflowEngine.js";

const ensureRedisConnection =
  async () => {
    const probeConnection =
      new Redis({
        host:
          process.env.REDIS_HOST ||
          "127.0.0.1",
        port:
          Number(
            process.env.REDIS_PORT
          ) || 6379,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 1500,
        retryStrategy: () => null,
      });

    probeConnection.on(
      "error",
      () => {}
    );

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

const workflowWorker =
  new Worker(

    "workflowQueue",

   async (job) => {

      const {
        workflowId,
        initialContext,
      } = job.data;

      console.log(
        "Procesando workflow:",
        workflowId
      );

      await executeWorkflow(
        workflowId,
        initialContext
      );
    },

    {
      connection,

      concurrency: 5,
    }
  );

workflowWorker.on(
  "error",
  (err) => {
    console.error(
      "Worker Redis error:",
      err.message
    );
  }
);

workflowWorker.on(
  "completed",

  (job) => {

    console.log(
      `Job ${job.id} completado`
    );
  }
);

workflowWorker.on(
  "failed",

  (job, err) => {

    console.log(
      `Job ${job.id} falló`,
      err.message
    );
  }
);
