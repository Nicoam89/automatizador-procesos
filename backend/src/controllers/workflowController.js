import Workflow
  from "../models/Workflow.js";

import WorkflowExecution
  from "../models/WorkflowExecution.js";

import NodeExecution
  from "../models/NodeExecution.js";

import workflowQueue
  from "../queues/workflowQueue.js";

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

      res.status(500).json({
        message:
          error.message,
      });

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

      res.status(500).json({
        message:
          error.message,
      });

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

        return res
          .status(404)
          .json({
            message:
              "Workflow no encontrado",
          });
      }

      res.json(workflow);

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

export const executeWorkflowController =
  async (req, res) => {

    try {

      const job =
        await workflowQueue.add(

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

      res.status(500).json({
        message:
          error.message,
      });

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

      res.status(500).json({
        message:
          error.message,
      });

    }
  };