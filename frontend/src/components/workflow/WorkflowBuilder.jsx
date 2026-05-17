import { useCallback, useEffect, useMemo, useState } from "react";

import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
} from "reactflow";

import "reactflow/dist/style.css";

import api from "../../api/axios";
import socket from "../../socket";

const NODE_DEFINITIONS = {
  log: { label: "Logger", config: { message: "Usuario: {{1.data.title}}" } },
  delay: { label: "Delay", config: { duration: 3000 } },
  http: {
    label: "HTTP Request",
    config: { url: "https://jsonplaceholder.typicode.com/todos/1", method: "GET", headers: {}, body: {} },
  },
  condition: { label: "Condition", config: { left: "{{1.data.userId}}", operator: "==", right: "1" } },
  webhook: {
    label: "Webhook",
    config: { url: "https://webhook.site/endpoint-demo", method: "POST", headers: { "Content-Type": "application/json" }, body: { event: "workflow.alert", source: "{{1.data.title}}" } },
  },
  transform: { label: "Transform", config: { fields: { userId: "{{1.data.userId}}", title: "{{1.data.title}}" } } },
  setContext: { label: "Set Context", config: { values: { status: "processed", reference: "{{1.data.title}}" } } },
  mail: {
      label: "Mail",
      config: {
        transport: { host: "smtp.mailtrap.io", port: 2525, secure: false, auth: { user: "", pass: "" } },
        message: { from: "bot@workflow.local", to: "destino@correo.com", subject: "Notificación {{node-1.data.title}}", text: "Hola, esto es una alerta" },
      },
    },
    textParser: {
      label: "Text Parser",
      config: { mode: "json", input: '{"key":"value"}', pattern: "(\\w+)=(\\w+)", flags: "g", delimiter: "=", lineSeparator: "\n" },
    },
    code: {
      label: "Código",
      config: { input: { value: 5 }, code: "output = { doubled: input.value * 2 };", timeoutMs: 1000 },
    },

};

function WorkflowBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [savedWorkflowId, setSavedWorkflowId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [configText, setConfigText] = useState("{}");
  const [configError, setConfigError] = useState("");

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  useEffect(() => {
    const setNodeColor = (nodeId, color) => {
      setNodes((nds) => nds.map((node) => (node.id === nodeId ? { ...node, style: { ...node.style, background: color } } : node)));
    };

    socket.on("workflow:node-running", ({ nodeId }) => setNodeColor(nodeId, "#facc15"));
    socket.on("workflow:node-completed", ({ nodeId }) => setNodeColor(nodeId, "#22c55e"));
    socket.on("workflow:node-failed", ({ nodeId }) => setNodeColor(nodeId, "#ef4444"));

    return () => {
      socket.off("workflow:node-running");
      socket.off("workflow:node-completed");
      socket.off("workflow:node-failed");
    };
  }, []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const addNode = (actionType = "log") => {
    const definition = NODE_DEFINITIONS[actionType];
    setNodes((nds) => {
      const nextIndex = nds.length + 1;
      const newNode = {
        id: `node-${nextIndex}`,
        type: "default",
        position: { x: 80 * nextIndex, y: 60 * nextIndex },
        data: { label: definition.label, actionType, config: definition.config },
      };

      return [...nds, newNode];
    });
  };

  const applyConfigToNode = () => {
    if (!selectedNode) return;

    try {
      const parsed = JSON.parse(configText);
      setNodes((nds) => nds.map((node) => (node.id === selectedNode.id ? { ...node, data: { ...node.data, config: parsed } } : node)));
      setConfigError("");
    } catch {
      setConfigError("JSON inválido. Revisá llaves, comas y comillas.");
    }
  };

  const executeWorkflowHandler = async () => {
    if (!savedWorkflowId) return alert("Primero guardá el workflow");
    try {
      await api.post(`/api/workflows/${savedWorkflowId}/execute`);
      alert("Workflow ejecutado");
    } catch (error) {
      console.error(error);
    }
  };

  const saveWorkflow = async () => {
    try {
      const response = await api.post("/api/workflows", { name: workflowName, nodes, edges });
      setSavedWorkflowId(response.data._id);
      alert("Workflow guardado");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="text" placeholder="Nombre workflow" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
        {Object.keys(NODE_DEFINITIONS).map((type) => (
          <button key={type} onClick={() => addNode(type)}>{`Nodo ${NODE_DEFINITIONS[type].label}`}</button>
        ))}
        <button onClick={saveWorkflow}>Guardar Workflow</button>
        <button onClick={executeWorkflowHandler}>Ejecutar Workflow</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
        <div style={{ height: "80vh" }}>
          <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={(_, node) => { setSelectedNodeId(node.id); setConfigText(JSON.stringify(node.data.config || {}, null, 2)); setConfigError(""); }} fitView>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        <aside style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h4 style={{ marginTop: 0 }}>Configuración de nodo</h4>
          {!selectedNode ? (
            <p>Seleccioná un nodo para editar su configuración.</p>
          ) : (
            <>
              <p><strong>{selectedNode.data.label}</strong> ({selectedNode.data.actionType})</p>
              <textarea value={configText} onChange={(e) => setConfigText(e.target.value)} style={{ width: "100%", minHeight: 320, fontFamily: "monospace", fontSize: 12 }} />
              {configError && <p style={{ color: "#dc2626" }}>{configError}</p>}
              <button onClick={applyConfigToNode}>Aplicar Configuración</button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default WorkflowBuilder;