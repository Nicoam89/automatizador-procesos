import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use("/api/auth", authRoutes);
app.use("/api/automations", automationRoutes);
app.use("/api/workflows",  workflowRoutes);
app.use("/api/webhooks",  webhookRoutes);

export default app;