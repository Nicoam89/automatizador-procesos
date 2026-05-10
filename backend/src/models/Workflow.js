import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    nodes: [
      {
        type: Object,
      },
    ],

    edges: [
      {
        type: Object,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trigger: {
      type: String,
      default: "manual",
    },

    webhookPath: {
      type: String,
      unique: true,
      sparse: true,
    },

  },
  {
    timestamps: true,
  }
);

const Workflow = mongoose.model(
  "Workflow",
  workflowSchema
);

export default Workflow;