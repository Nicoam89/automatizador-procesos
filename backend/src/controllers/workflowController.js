import Workflow
  from "../models/Workflow.js";

import WorkflowExecution
  from "../models/WorkflowExecution.js";

import NodeExecution
  from "../models/NodeExecution.js";

import {
  getWorkflowQueue,
} from "../queues/workflowQueue.js";
import { ApiError, sendError } from "../utils/apiError.js";


export const createWorkflow =
  async (req, res) => {

    try {

      const workflow =
        await Workflow.create({

          name:
            req.body.name,

          nodes:
            req.body.nodes,

          edges:
            req.body.edges,

          trigger:
            req.body.trigger ||
            "manual",

          webhookPath:
            req.body.webhookPath,

          createdBy:
            req.user?.id,
        });

      res.status(201).json(
        workflow
      );

    } catch (error) {

      sendError(res, error);

    }
  };

export const getWorkflows =
  async (req, res) => {

    try {

      const workflows =
        await Workflow.find()
          .sort({
            createdAt: -1,
          });

      res.json(workflows);

    } catch (error) {

      sendError(res, error);

    }
  };

export const getWorkflowById =
  async (req, res) => {

    try {

      const workflow =
        await Workflow.findById(
          req.params.id
        );

      if (!workflow) {

        return sendError(
          res,
          new ApiError(404, "WORKFLOW_NOT_FOUND", "Workflow no encontrado")
        );
      }

      res.json(workflow);

    } catch (error) {

      sendError(res, error);

    }
  };

export const executeWorkflowController =
  async (req, res) => {

    try {

      const job =
        await getWorkflowQueue().add(

          "executeWorkflow",

          {
            workflowId:
              req.params.id,

            initialContext:
              {},
          },

          {
            attempts: 3,

            backoff: {
              type:
                "exponential",

              delay: 3000,
            },
          }
        );

      res.json({

        success: true,

        jobId: job.id,
      });

    } catch (error) {

      sendError(res, error);

    }
  };

export const getExecutionDebugger =
  async (req, res) => {

    try {

      const execution =
        await WorkflowExecution
          .findById(
            req.params.id
          );

      const nodeExecutions =
        await NodeExecution.find({

          workflowExecution:
            req.params.id,

        }).sort({
          createdAt: 1,
        });

      res.json({

        execution,

        nodeExecutions,
      });

    } catch (error) {

      sendError(res, error);

    }
  };
  
export const getWorkflowExecutions =
  async (req, res) => {

    try {

      const executions =
        await WorkflowExecution
          .find()
          .populate("workflow")
          .sort({
            createdAt: -1,
          });

      res.json(executions);

    } catch (error) {

      sendError(res, error);

    }
  };
