import express from "express";

import {
  createAutomation,
  getAutomations,
  executeAutomation,
  getExecutions,
} from "../controllers/automationController.js";

const router = express.Router();

router.post("/", createAutomation);

router.get("/", getAutomations);

router.post(
  "/:id/execute",
  executeAutomation
);

router.get(
  "/executions/all",
  getExecutions
);

export default router;