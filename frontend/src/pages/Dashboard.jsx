import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await api.get("/api/health");

        setMessage(response.data.message);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <p>{message}</p>
    </div>
  );
}

export default Dashboard;