import { Worker }
  from "bullmq";

import connection
  from "../redis.js";

import {
  executeWorkflow,
} from "../services/workflowEngine.js";

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