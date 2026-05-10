import mongoose from "mongoose";

const nodeExecutionSchema =
  new mongoose.Schema(
    {
      workflowExecution: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "WorkflowExecution",
      },

      nodeId: {
        type: String,
      },

      nodeLabel: {
        type: String,
      },

      actionType: {
        type: String,
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

      input: {
        type: Object,
      },

      output: {
        type: Object,
      },

      error: {
        type: String,
      },

      startedAt: {
        type: Date,
      },

      finishedAt: {
        type: Date,
      },

      duration: {
        type: Number,
      },
    },

    {
      timestamps: true,
    }
  );

const NodeExecution =
  mongoose.model(
    "NodeExecution",
    nodeExecutionSchema
  );

export default NodeExecution;