import mongoose from "mongoose";

const automationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    trigger: {
      type: String,
      default: "manual",
    },

    schedule: {
        type: String,
        default: "",
    },

    actions: [
      {
        type: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Automation = mongoose.model(
  "Automation",
  automationSchema
);

export default Automation;