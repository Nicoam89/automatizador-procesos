import Automation from "../models/Automation.js";
import Execution from "../models/Execution.js";

import {
  enqueueAutomationExecution,
} from "../queues/automationQueue.js";

import {
  startAutomationJob,
  stopAutomationJob,
} from "../jobs/scheduler.js";
import { sendError } from "../utils/apiError.js";


export const createAutomation =
  async (req, res) => {

    try {

      const automation =
        await Automation.create(
          req.body
        );

      if (
        automation.trigger ===
          "cron" &&
        automation.status ===
          "active"
      ) {

        startAutomationJob(
          automation
        );
      }

      res.status(201).json(
        automation
      );

    } catch (error) {

      sendError(res, error);

    }
  };
  
export const getAutomations = async (
  req,
  res
) => {
  try {
    const automations =
      await Automation.find();

    res.json(automations);
  } catch (error) {
    sendError(res, error);
  }
};

export const executeAutomation =
  async (req, res) => {

    try {

     const job =
        await enqueueAutomationExecution({
          automationId: req.params.id,
          source: "manual",
        });

      res.status(202).json({
        message: "Automatización encolada",
        jobId: job.id,
      });


    } catch (error) {

      sendError(res, error);

    }
  };

export const getExecutions =
  async (req, res) => {

    try {

      const executions =
        await Execution.find()
          .populate("automation");

      res.json(executions);

    } catch (error) {

      sendError(res, error);

    }
  };
