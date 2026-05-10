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