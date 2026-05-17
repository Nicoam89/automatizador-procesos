import Workflow from "../models/Workflow.js";
import WorkflowExecution from "../models/WorkflowExecution.js";
import nodeExecutors from "./nodeExecutors/index.js";
import NodeExecution from "../models/NodeExecution.js";
import { getIo } from "../socket.js";

export const executeWorkflow = async (workflowId, initialContext = {}) => {
  const workflow = await Workflow.findById(workflowId);

  if (!workflow) {
    throw new Error("Workflow no encontrado");
  }

  const execution = await WorkflowExecution.create({
    workflow: workflow._id,
    status: "running",
    logs: [
      {
        message: "Iniciando workflow",
        context: { workflowId },
      },
    ],
    context: initialContext,
  });

  try {
    const visited = new Set();
    const firstNode = workflow.nodes[0];

    await processNode(firstNode, workflow, execution, visited);

    execution.status = "completed";
    appendExecutionLog(execution, {
      message: "Workflow finalizado",
      context: { workflowId },
    });
    await execution.save();

    return execution;
  } catch (error) {
    execution.status = "failed";
    appendExecutionLog(execution, {
      level: "error",
      message: `Error general del workflow: ${error.message}`,
      context: {
        workflowId,
      },
    });
    await execution.save();

    throw error;
  }
};

const processNode = async (node, workflow, execution, visited) => {
  if (!node || visited.has(node.id)) {
    return;
  }

  visited.add(node.id);

  appendExecutionLog(execution, {
    message: `Ejecutando nodo: ${node.data.label}`,
    nodeId: node.id,
    nodeLabel: node.data.label,
    context: {
      actionType: node.data.actionType,
    },
  });
  await execution.save();

  const nodeExecution = await NodeExecution.create({
    workflowExecution: execution._id,
    nodeId: node.id,
    nodeLabel: node.data.label,
    actionType: node.data.actionType,
    status: "running",
    input: {
      context: execution.context,
    },
    startedAt: new Date(),
  });

  getIo()?.emit("workflow:node-running", {
    workflowExecutionId: execution._id,
    nodeId: node.id,
  });

  const startTime = Date.now();
  let result;

  try {
    result = await executeNodeAction(node, execution.context);

    nodeExecution.status = "completed";
    nodeExecution.output = result;
    nodeExecution.finishedAt = new Date();
    nodeExecution.duration = Date.now() - startTime;
    await nodeExecution.save();

    getIo()?.emit("workflow:node-completed", {
      workflowExecutionId: execution._id,
      nodeId: node.id,
      output: result,
    });

    execution.context[node.id] = result;
    appendExecutionLog(execution, {
      message: `Nodo completado: ${node.data.label}`,
      nodeId: node.id,
      nodeLabel: node.data.label,
      context: {
        actionType: node.data.actionType,
        durationMs: Date.now() - startTime,
      },
    });
    await execution.save();
  } catch (error) {
    nodeExecution.status = "failed";
    nodeExecution.error = error.message;
    nodeExecution.finishedAt = new Date();
    nodeExecution.duration = Date.now() - startTime;
    await nodeExecution.save();

    getIo()?.emit("workflow:node-failed", {
      workflowExecutionId: execution._id,
      nodeId: node.id,
      error: error.message,
    });

    appendExecutionLog(execution, {
      level: "error",
      message: `Nodo falló: ${node.data.label}`,
      nodeId: node.id,
      nodeLabel: node.data.label,
      context: {
        actionType: node.data.actionType,
        error: error.message,
      },
    });
    await execution.save();

    throw error;
  }

  const outgoingEdges = workflow.edges.filter((edge) => edge.source === node.id);

  if (node.data.actionType === "condition") {
    const conditionResult = result?.result;

    const selectedEdge = outgoingEdges.find(
      (edge) => edge.label === (conditionResult ? "true" : "false")
    );

    if (selectedEdge) {
      const nextNode = workflow.nodes.find((n) => n.id === selectedEdge.target);
      await processNode(nextNode, workflow, execution, visited);
    }

    return;
  }

  for (const edge of outgoingEdges) {
    const nextNode = workflow.nodes.find((n) => n.id === edge.target);
    await processNode(nextNode, workflow, execution, visited);
  }
};

const appendExecutionLog = (execution, logData) => {
  execution.logs.push({
    level: logData.level || "info",
    message: logData.message,
    nodeId: logData.nodeId,
    nodeLabel: logData.nodeLabel,
    timestamp: new Date(),
    context: logData.context || {},
  });
};

const executeNodeAction = async (node, context) => {
  const actionType = node.data.actionType;
  const executor = nodeExecutors[actionType];

  if (!executor) {
    throw new Error(`Executor no encontrado: ${actionType}`);
  }

  return await executor(node, context);
};
