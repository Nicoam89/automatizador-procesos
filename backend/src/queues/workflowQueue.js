import { Queue }
  from "bullmq";

import connection
  from "../redis.js";

const workflowQueue =
  new Queue(
    "workflowQueue",
    {
      connection,
    }
  );

export default workflowQueue;