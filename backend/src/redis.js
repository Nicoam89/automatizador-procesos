import Redis
  from "ioredis";

const connection =
  new Redis({

    host:
      process.env.REDIS_HOST ||
      "127.0.0.1",

    port:
      Number(
        process.env.REDIS_PORT
      ) || 6379,

    maxRetriesPerRequest:
      null,

    lazyConnect: true,

    retryStrategy: (
      attempts
    ) =>
      Math.min(
        attempts * 1000,
        5000
      ),
  });

let hasLoggedConnectionError =
  false;

connection.on(
  "error",
  (error) => {
    if (
      hasLoggedConnectionError
    ) {
      return;
    }

    hasLoggedConnectionError =
      true;

    if (
      process.env.REDIS_LOG_ERRORS ===
      "true"
    ) {
      console.error(
        "Redis no disponible:",
        error.message
      );
    }
  }
);

connection.on(
  "ready",
  () => {
    hasLoggedConnectionError =
      false;
  }
);

export default connection;
