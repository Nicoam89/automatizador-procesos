import Automation from "../models/Automation.js";
import Execution from "../models/Execution.js";

import {
  executeAutomationService,
} from "../services/automationService.js";

import {
  startAutomationJob,
  stopAutomationJob,
} from "../jobs/scheduler.js";


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

      res.status(500).json({
        message:
          error.message,
      });

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
    res.status(500).json({
      message: error.message,
    });
  }
};

export const executeAutomation =
  async (req, res) => {

    try {

      const execution =
        await executeAutomationService(
          req.params.id
        );

      res.json(execution);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

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

      res.status(500).json({
        message: error.message,
      });

    }
  };