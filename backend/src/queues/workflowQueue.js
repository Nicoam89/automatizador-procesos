import { Queue }
  from "bullmq";

import connection
  from "../redis.js";

let workflowQueue =
  null;

export const getWorkflowQueue =
  () => {
    if (!workflowQueue) {
      workflowQueue =
        new Queue(
          "workflowQueue",
          {
            connection,
          }
        );
    }

    return workflowQueue;
  };
