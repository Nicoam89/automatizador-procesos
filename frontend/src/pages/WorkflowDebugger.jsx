import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useParams }
  from "react-router-dom";

import api
  from "../api/axios";

function WorkflowDebugger() {

  const { id } =
    useParams();

  const [debug,
    setDebug] =
    useState(null);

  const fetchDebug =
    useCallback(async () => {

      try {

        const response =
          await api.get(
            `/api/workflows/executions/${id}/debug`
          );

        setDebug(
          response.data
        );

      } catch (error) {

        console.error(error);

      }
    }, [id]);

    useEffect(() => {
    Promise.resolve().then(fetchDebug);
  }, [fetchDebug]);


  if (!debug) {
    return <p>Cargando...</p>;
  }

  return (
    <div>

      <h1>
        Workflow Debugger
      </h1>

            <h2>
        Estado de ejecución: {debug.execution?.status}
      </h2>

      <h3>Logs de ejecución</h3>
      <div style={{ marginBottom: "20px" }}>
        {(debug.execution?.logs || []).map((log, index) => (
          <div
            key={`${log.timestamp}-${index}`}
            style={{
              borderLeft:
                log.level === "error"
                  ? "4px solid #d32f2f"
                  : "4px solid #2e7d32",
              paddingLeft: "10px",
              marginBottom: "8px",
            }}
          >
            <p>
              <strong>{(log.level || "info").toUpperCase()}</strong> - {log.message}
            </p>
            <p>
              {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Sin fecha"}
            </p>
            {log.nodeLabel ? <p>Nodo: {log.nodeLabel}</p> : null}
            {log.context && Object.keys(log.context).length > 0 ? (
              <pre>{JSON.stringify(log.context, null, 2)}</pre>
            ) : null}
          </div>
        ))}
      </div>

      {debug.nodeExecutions.map(
        (node) => (

          <div
            key={node._id}

            style={{
              border:
                "1px solid #ccc",

              marginBottom:
                "10px",

              padding: "10px",
            }}
          >

            <h3>
              {node.nodeLabel}
            </h3>

            <p>
              Estado:
              {" "}
              {node.status}
            </p>

            <p>
              Tipo:
              {" "}
              {node.actionType}
            </p>

            <p>
              Duración:
              {" "}
              {node.duration}ms
            </p>

            <pre>
              INPUT:
              {JSON.stringify(
                node.input,
                null,
                2
              )}
            </pre>

            <pre>
              OUTPUT:
              {JSON.stringify(
                node.output,
                null,
                2
              )}
            </pre>

            {node.error ? (
              <pre style={{ color: "#d32f2f" }}>
                ERROR:
                {node.error}
              </pre>
            ) : null}

          </div>
        )
      )}

    </div>
  );
}

export default WorkflowDebugger;
