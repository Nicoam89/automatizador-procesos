

import Workflow from "../models/Workflow.js";

import WorkflowExecution from "../models/WorkflowExecution.js";
import nodeExecutors from "./nodeExecutors/index.js";
import NodeExecution from "../models/NodeExecution.js";
import { getIo } from "../socket.js";

export const executeWorkflow =
  async (
    workflowId,
    initialContext = {}
  ) => {

    const workflow =
      await Workflow.findById(
        workflowId
      );

    if (!workflow) {
      throw new Error(
        "Workflow no encontrado"
      );
    }

    const execution =
      await WorkflowExecution.create({
        workflow: workflow._id,

        status: "running",

      logs: [
        "Iniciando workflow",
      ],

      context: initialContext,
      });

    try {

      const visited =
        new Set();

      const firstNode =
        workflow.nodes[0];

      await processNode(
        firstNode,
        workflow,
        execution,
        visited
      );

      execution.status =
        "completed";

      execution.logs.push(
        "Workflow finalizado"
      );

      await execution.save();

      return execution;

    } catch (error) {

      execution.status =
        "failed";

      execution.logs.push(
        `Error: ${error.message}`
      );

      await execution.save();

      throw error;
    }
  };

const processNode =
  async (
    node,
    workflow,
    execution,
    visited
  ) => {

    if (
      !node ||
      visited.has(node.id)
    ) {
      return;
    }

    visited.add(node.id);

    execution.logs.push(
      `Ejecutando nodo: ${node.data.label}`
    );

    await execution.save();

const nodeExecution =
  await NodeExecution.create({
    
    

    workflowExecution:
      execution._id,

    nodeId: node.id,

    nodeLabel:
      node.data.label,

    actionType:
      node.data.actionType,

    status: "running",

    input: {
      context:
        execution.context,
    },

    startedAt:
      new Date(),  

  });

getIo()?.emit(
  "workflow:node-running",
  {
    workflowExecutionId:
      execution._id,

    nodeId: node.id,
  }
);

const startTime =
  Date.now();

try {

  const result =
    await executeNodeAction(
      node,
      execution.context
    );

  const duration =
    Date.now() -
    startTime;

  nodeExecution.status =
    "completed";

  nodeExecution.output =
    result;

  nodeExecution.finishedAt =
    new Date();

  nodeExecution.duration =
    duration;

  await nodeExecution.save();

  getIo()?.emit(
  "workflow:node-completed",
  {
    workflowExecutionId:
      execution._id,

    nodeId: node.id,

    output: result,
  }
);

  execution.context[
    node.id
  ] = result;

  await execution.save();

  var resultData =
    result;

} catch (error) {

  nodeExecution.status =
    "failed";

  nodeExecution.error =
    error.message;

  nodeExecution.finishedAt =
    new Date();

  nodeExecution.duration =
    Date.now() -
    startTime;

  await nodeExecution.save();

  getIo()?.emit(
  "workflow:node-failed",
  {
    workflowExecutionId:
      execution._id,

    nodeId: node.id,

    error:
      error.message,
  }
);

  throw error;
}
execution.context[
  node.id
] = result;

await execution.save();

    const outgoingEdges =
  workflow.edges.filter(
    (edge) =>
      edge.source ===
      node.id
  );

if (
  node.data.actionType ===
  "condition"
) {

  const conditionResult =
    result.result;

  const selectedEdge =
    outgoingEdges.find(
      (edge) =>
        edge.label ===
        (
          conditionResult
            ? "true"
            : "false"
        )
    );

  if (selectedEdge) {

    const nextNode =
      workflow.nodes.find(
        (n) =>
          n.id ===
          selectedEdge.target
      );

    await processNode(
      nextNode,
      workflow,
      execution,
      visited
    );
  }

} else {

  for (const edge of outgoingEdges) {

    const nextNode =
      workflow.nodes.find(
        (n) =>
          n.id ===
          edge.target
      );

    await processNode(
      nextNode,
      workflow,
      execution,
      visited
    );
  }
}
  };

const executeNodeAction =
  async (
    node,
    context
  ) => {

    const actionType =
      node.data.actionType;

    const executor =
      nodeExecutors[
        actionType
      ];

    if (!executor) {

      throw new Error(
        `Executor no encontrado: ${actionType}`
      );
    }

return await executor(
  node,
  context
);
  };