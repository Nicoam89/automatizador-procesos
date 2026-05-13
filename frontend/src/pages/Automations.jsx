import { useEffect, useState } from "react";

import api from "../api/axios";

function Automations() {
  const [automations, setAutomations] =
    useState([]);

  const [executions, setExecutions] =
  useState([]);

 const [form, setForm] =
  useState({
    name: "",
    description: "",
    trigger: "manual",
    schedule: "",
    status: "inactive",
  });

  const fetchAutomations = async () => {
    try {
      const response = await api.get(
        "/api/automations"
      );

      setAutomations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExecutions = async () => {

  try {

    const response = await api.get(
      "/api/automations/executions/all"
    );

    setExecutions(response.data);

  } catch (error) {

    console.error(error);

  }
};

useEffect(() => {
  Promise.resolve().then(fetchAutomations);
  Promise.resolve().then(fetchExecutions);
}, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/api/automations",
        form
      );

      setForm({
        name: "",
        description: "",
        
      });

      fetchAutomations();
    } catch (error) {
      console.error(error);
    }
  };

const executeAutomation = async (
  id
) => {

  try {

    await api.post(
      `/api/automations/${id}/execute`
    );

    fetchExecutions();

  } catch (error) {

    console.error(error);

  }
};

  return (
    <div>
      <h1>Automatizaciones</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />
        <select 
          name="trigger"
          value={form.trigger}
          onChange={handleChange}
        >
          <option value="manual">
            Manual
          </option>

          <option value="cron">
            Cron Job
          </option>
        </select>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="inactive">
            Inactivo
          </option>

          <option value="active">
            Activo
          </option>
        </select>

        <input
          type="text"
          name="schedule"
          placeholder="* * * * *"
          value={form.schedule}
          onChange={handleChange}
        />
        <button type="submit">
          Crear
        </button>
      </form>

      <hr />
        <h2>Historial</h2>

        {executions.map((execution) => (
          <div
            key={execution._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h4>
              {
                execution.automation?.name
              }
            </h4>

            <p>
              Estado: {execution.status}
            </p>

            <ul>
              {execution.logs.map(
                (log, index) => (
                  <li key={index}>
                    {log}
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      {automations.map((automation) => (
        <div key={automation._id}>
          <h3>{automation.name}</h3>

          <p>
            {automation.description}
          </p>

          <p>
            Estado: {automation.status}
          </p>
          <button
            onClick={() =>
              executeAutomation(
                automation._id
              )
            }
          >
            Ejecutar
          </button>
        </div>
      ))}
    </div>
  );
}

export default Automations;