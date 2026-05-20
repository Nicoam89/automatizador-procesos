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
import "/src/styles/global.css";


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
  const [history, setHistory] = useState([]);
  const [copiedNode, setCopiedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState("");
  const [savedWorkflowId, setSavedWorkflowId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [configText, setConfigText] = useState("{}");
  const [configError, setConfigError] = useState("");

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const createSnapshot = useCallback((nextNodes, nextEdges) => ({
    nodes: JSON.parse(JSON.stringify(nextNodes)),
    edges: JSON.parse(JSON.stringify(nextEdges)),
  }), []);

  const pushHistory = useCallback((nextNodes, nextEdges) => {
    setHistory((prev) => [...prev, createSnapshot(nextNodes, nextEdges)]);
  }, [createSnapshot]);

  const getNextNodeId = useCallback((currentNodes) => {
    const maxId = currentNodes.reduce((acc, node) => {
      const match = /^node-(\d+)$/.exec(node.id);
      return match ? Math.max(acc, Number(match[1])) : acc;
    }, 0);

    return `node-${maxId + 1}`;
  }, []);

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

  const onConnect = useCallback((params) => {
    const nextEdges = addEdge(params, edges);
    pushHistory(nodes, edges);
    setEdges(nextEdges);
  }, [edges, nodes, pushHistory]);

  const onNodesChange = useCallback((changes) => {
    const nextNodes = applyNodeChanges(changes, nodes);
    pushHistory(nodes, edges);
    setNodes(nextNodes);
  }, [edges, nodes, pushHistory]);

  const onEdgesChange = useCallback((changes) => {
    const nextEdges = applyEdgeChanges(changes, edges);
    pushHistory(nodes, edges);
    setEdges(nextEdges);
  }, [edges, nodes, pushHistory]);

  const addNode = (actionType = "log") => {
    const definition = NODE_DEFINITIONS[actionType];
    pushHistory(nodes, edges);
    setNodes((nds) => {
      const nextId = getNextNodeId(nds);
      const newNode = {
        id: nextId,
        type: "default",
        position: { x: 80 * (nds.length + 1), y: 60 * (nds.length + 1) },
        data: { label: definition.label, actionType, config: definition.config },
      };

      return [...nds, newNode];
    });
  };

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;

    pushHistory(nodes, edges);
    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
    setConfigText("{}");
    setConfigError("");
  }, [selectedNodeId, nodes, edges, pushHistory]);

  const undoLastAction = useCallback(() => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const lastSnapshot = prev[prev.length - 1];
      setNodes(lastSnapshot.nodes);
      setEdges(lastSnapshot.edges);
      setSelectedNodeId((currentSelectedId) => (lastSnapshot.nodes.some((node) => node.id === currentSelectedId) ? currentSelectedId : null));
      return prev.slice(0, -1);
    });
  }, []);

  const copySelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setCopiedNode(JSON.parse(JSON.stringify(selectedNode)));
  }, [selectedNode]);

  const pasteCopiedNode = useCallback(() => {
    if (!copiedNode) return;

    pushHistory(nodes, edges);
    const nextId = getNextNodeId(nodes);
    const pastedNode = {
      ...JSON.parse(JSON.stringify(copiedNode)),
      id: nextId,
      position: { x: copiedNode.position.x + 40, y: copiedNode.position.y + 40 },
    };

    setNodes((nds) => [...nds, pastedNode]);
    setSelectedNodeId(nextId);
    setConfigText(JSON.stringify(pastedNode.data.config || {}, null, 2));
    setConfigError("");
  }, [copiedNode, edges, getNextNodeId, nodes, pushHistory]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const targetTag = event.target.tagName?.toLowerCase();
      const isInputTarget = targetTag === "input" || targetTag === "textarea";

      if ((event.key === "Delete" || event.key === "Backspace") && !isInputTarget) {
        event.preventDefault();
        deleteSelectedNode();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoLastAction();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && !isInputTarget) {
        event.preventDefault();
        copySelectedNode();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && !isInputTarget) {
        event.preventDefault();
        pasteCopiedNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySelectedNode, deleteSelectedNode, pasteCopiedNode, undoLastAction]);

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
       <div className="workflow-toolbar">
        <input type="text" placeholder="Nombre workflow" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
        <div className="workflow-toolbar__node-buttons">
          {Object.keys(NODE_DEFINITIONS).map((type) => (
            <button key={type} onClick={() => addNode(type)}>{`${NODE_DEFINITIONS[type].label}`}</button>
          ))}
        </div>
        <div className="workflow-toolbar__feature-buttons">
          <button className="workflow-feature-btn" onClick={saveWorkflow}>Guardar Workflow</button>
          <button className="workflow-feature-btn" onClick={executeWorkflowHandler}>Ejecutar Workflow</button>
          <button className="workflow-feature-btn" onClick={copySelectedNode} disabled={!selectedNode}>Copiar Nodo</button>
          <button className="workflow-feature-btn" onClick={pasteCopiedNode} disabled={!copiedNode}>Pegar Nodo</button>
          <button className="workflow-feature-btn" onClick={undoLastAction} disabled={!history.length}>Deshacer</button>
          <button className="workflow-feature-btn" onClick={deleteSelectedNode} disabled={!selectedNode}>Eliminar Nodo</button>
        </div>
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