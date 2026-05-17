import { resolveConfig, resolveTemplate } from "./utils.js";

const mailExecutor = async (node, context) => {
  const config = node.data.config || {};
  const message = resolveConfig(config.message || {}, context);

  if (!message.to) {
    throw new Error("mailExecutor: 'message.to' es requerido");
  }

  const mailPayload = {
    from: resolveTemplate(message.from || process.env.SMTP_FROM || "no-reply@workflow.local", context),
    to: message.to,
    cc: message.cc,
    bcc: message.bcc,
    subject: resolveTemplate(message.subject || "Workflow notification", context),
    text: message.text,
    html: message.html,
  };

  return {
    success: true,
    provider: "mock",
    delivered: false,
    note: "Nodo mail agregado. Configurá un proveedor SMTP/API para envío real.",
    payload: mailPayload,
  };
};

export default mailExecutor;
