import express
  from "express";

import {

  createWorkflow,

  getWorkflows,

  getWorkflowById,

  executeWorkflowController,

  getExecutionDebugger,

} from "../controllers/workflowController.js";

const router =
  express.Router();

router.post(
  "/",
  createWorkflow
);

router.get(
  "/",
  getWorkflows
);

router.get(
  "/:id",
  getWorkflowById
);

router.post(
  "/:id/execute",
  executeWorkflowController
);

router.get(
  "/executions/:id/debug",
  getExecutionDebugger
);

export default router;