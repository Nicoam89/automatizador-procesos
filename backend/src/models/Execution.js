import mongoose from "mongoose";

const executionSchema = new mongoose.Schema(
  {
    automation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Automation",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    logs: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Execution = mongoose.model(
  "Execution",
  executionSchema
);

export default Execution;