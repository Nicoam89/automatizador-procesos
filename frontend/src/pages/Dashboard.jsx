import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/global.scss";

function Dashboard() {
  const [metrics, setMetrics] = useState({
    activeAutomations: 0,
    workflowsExecuted: 0,
    latestErrorExecutionId: null,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [automationsResponse, workflowsResponse] =
          await Promise.all([
            api.get("/api/automations"),
            api.get("/api/workflows/executions"),
          ]);

        const automations = automationsResponse.data || [];
        const workflowExecutions = workflowsResponse.data || [];

        const activeAutomations = automations.filter(
          (automation) => automation.status === "active"
        ).length;

        const latestErrorExecution = workflowExecutions.find(
          (execution) => execution.status === "failed"
        );

        setMetrics({
          activeAutomations,
          workflowsExecuted: workflowExecutions.length,
          latestErrorExecutionId: latestErrorExecution?._id || null,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>Dashboard</h1>
        <p>Resumen de actividad y estado del sistema.</p>
      </header>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Automatizaciones activas</h2>
          <p className="dashboard-card__metric">{metrics.activeAutomations}</p>
          <small>Automatizaciones con estado activo.</small>
        </article>

        <article className="dashboard-card">
          <h2>Workflows ejecutados</h2>
          <p className="dashboard-card__metric">{metrics.workflowsExecuted}</p>
          <small>Total de ejecuciones registradas.</small>
        </article>

        <article className="dashboard-card dashboard-card--errors">
          <h2>Log de errores</h2>
          {metrics.latestErrorExecutionId ? (
            <Link
              className="dashboard-card__link"
              to={`/workflows/executions/${metrics.latestErrorExecutionId}/debug`}
            >
              Ver último error
            </Link>
          ) : (
            <p className="dashboard-card__empty">No hay ejecuciones con error.</p>
          )}
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
