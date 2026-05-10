import {
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

  useEffect(() => {

    fetchDebug();

  }, []);

  const fetchDebug =
    async () => {

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
    };

  if (!debug) {
    return <p>Cargando...</p>;
  }

  return (
    <div>

      <h1>
        Workflow Debugger
      </h1>

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
              {JSON.stringify(
                node.output,
                null,
                2
              )}
            </pre>

          </div>
        )
      )}

    </div>
  );
}

export default WorkflowDebugger;