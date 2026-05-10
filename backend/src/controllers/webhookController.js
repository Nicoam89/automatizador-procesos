import Workflow from "../models/Workflow.js";

import {
  executeWorkflow,
} from "../services/workflowEngine.js";

export const triggerWebhook =
  async (req, res) => {

    try {

      const workflow =
        await Workflow.findOne({
          webhookPath:
            req.params.path,
        });

      if (!workflow) {

        return res
          .status(404)
          .json({
            message:
              "Webhook no encontrado",
          });
      }

      const context = {

        webhook: {

          body: req.body,

          headers:
            req.headers,

          query:
            req.query,
        },
      };

      const execution =
        await executeWorkflow(
          workflow._id,
          context
        );

      res.json({
        success: true,
        executionId:
          execution._id,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };