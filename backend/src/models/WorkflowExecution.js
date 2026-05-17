import mongoose from "mongoose";

const workflowExecutionSchema =
  new mongoose.Schema(
    {
      workflow: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Workflow",
      },

      status: {
        type: String,

        enum: [
          "running",
          "completed",
          "failed",
        ],

        default: "running",
      },

      logs: [
        {
          level: {
            type: String,
            enum: ["info", "error"],
            default: "info",
          },
          message: {
            type: String,
            required: true,
          },
          nodeId: {
            type: String,
          },
          nodeLabel: {
            type: String,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          context: {
           type: Object,
          default: {},
          },
        },
      ],
    },

    {
      timestamps: true,
    }
  );

  

const WorkflowExecution =
  mongoose.model(
    "WorkflowExecution",
    workflowExecutionSchema
  );

export default WorkflowExecution;
