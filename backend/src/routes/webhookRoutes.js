import express from "express";

import {
  triggerWebhook,
} from "../controllers/webhookController.js";

const router = express.Router();

router.post(
  "/:path",
  triggerWebhook
);

export default router;