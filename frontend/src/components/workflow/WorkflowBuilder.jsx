import {
  useCallback,
  useState,
  useEffect,
} from "react";

import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
} from "reactflow";

import "reactflow/dist/style.css";

import api from "../../api/axios";
import socket from "../../socket";

function WorkflowBuilder() {

  const [nodes, setNodes] =
    useState([]);

  const [edges, setEdges] =
    useState([]);

  const [workflowName,
    setWorkflowName] =
    useState("");
    useEffect(() => {

  socket.on(
    "workflow:node-running",
    ({ nodeId }) => {

      setNodes((nds) =>
        nds.map((node) =>

          node.id === nodeId

            ? {
                ...node,

                style: {
                  background:
                    "#facc15",
                },
              }

            : node
        )
      );
    }
  );

  socket.on(
    "workflow:node-completed",
    ({ nodeId }) => {

      setNodes((nds) =>
        nds.map((node) =>

          node.id === nodeId

            ? {
                ...node,

                style: {
                  background:
                    "#22c55e",
                },
              }

            : node
        )
      );
    }
  );

  socket.on(
    "workflow:node-failed",
    ({ nodeId }) => {

      setNodes((nds) =>
        nds.map((node) =>

          node.id === nodeId

            ? {
                ...node,

                style: {
                  background:
                    "#ef4444",
                },
              }

            : node
        )
      );
    }
  );

  return () => {

    socket.off(
      "workflow:node-running"
    );

    socket.off(
      "workflow:node-completed"
    );

    socket.off(
      "workflow:node-failed"
    );
  };

}, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(params, eds)
      ),
    []
  );

const addNode = (
  actionType = "log"
) => {

  const configs = {

    log: {
      message:
       "Usuario: {{1.data.title}}"
    },

    delay: {
      duration: 3000,
    },

    http: {
      url:
        "https://jsonplaceholder.typicode.com/todos/1",

      method: "GET",
    },

    condition: {

      left:
        "{{1.data.userId}}",

      operator: "==",

      right: "1",
    },

  };

  const labels = {

    log: "Logger",

    delay: "Delay",

    http: "HTTP Request",

    condition: "Condition",
  };

  const newNode = {

    id: `${nodes.length + 1}`,

    type: "default",

    position: {
      x: Math.random() * 400,
      y: Math.random() * 400,
    },

    data: {

      label:
        labels[actionType],

      actionType,

      config:
        configs[actionType],
    },
  };

  setNodes((nds) => [
    ...nds,
    newNode,
  ]);
};

const [savedWorkflowId,
  setSavedWorkflowId] =
  useState(null);

  const saveWorkflow =
    async () => {

      try {

const executeWorkflowHandler =
  async () => {

    if (!savedWorkflowId) {

      alert(
        "Primero guardá el workflow"
      );

      return;
    }

    try {

      await api.post(
        `/api/workflows/${savedWorkflowId}/execute`
      );

      alert(
        "Workflow ejecutado"
      );

    } catch (error) {

      console.error(error);

    }
  };


const response =
  await api.post(
    "/api/workflows",
    {
      name:
        workflowName,
      nodes,
      edges,
    }
  );

setSavedWorkflowId(
  response.data._id
);

        alert(
          "Workflow guardado"
        );

      } catch (error) {

        console.error(error);

      }
    };

  return (
    <div>

      <div
        style={{
          marginBottom: "10px",
        }}
      >

        <input
          type="text"
          placeholder="Nombre workflow"
          value={workflowName}
          onChange={(e) =>
            setWorkflowName(
              e.target.value
            )
          }
        />
  



<button
  onClick={() =>
    addNode("log")
  }
>
  Nodo Log
</button>

<button
  onClick={() =>
    addNode("delay")
  }
>
  Nodo Delay
</button>

<button
  onClick={() =>
    addNode("http")
  }
>
  Nodo HTTP
</button>

        <button
          onClick={saveWorkflow}
        >
          Guardar Workflow
        </button>

          <button
  onClick={
    executeWorkflowHandler
  }
>
  Ejecutar Workflow
</button>

      </div>

      <div
        style={{
          height: "80vh",
        }}
      >

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />

          <Controls />

          <Background />
        </ReactFlow>

      </div>
    </div>
  );
}

export default WorkflowBuilder;