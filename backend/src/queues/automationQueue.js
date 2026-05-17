import { Queue } from "bullmq";

import connection from "../redis.js";

let automationQueue = null;

export const getAutomationQueue = () => {
  if (!automationQueue) {
    automationQueue = new Queue("automationQueue", {
      connection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }

  return automationQueue;
};

export const enqueueAutomationExecution = async ({
  automationId,
  source = "manual",
}) => {
  const queue = getAutomationQueue();

  return queue.add(
    "execute-automation",
    {
      automationId,
      source,
    },
    {
      jobId: `${automationId}:${source}:${Date.now()}`,
    }
  );
};
