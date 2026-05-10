import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function MainLayout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <aside
        style={{
          width: "220px",
          background: "#111827",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>
          Automatizador
        </h2>

        <p style={{ marginBottom: "20px" }}>
          {user?.name}
        </p>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <Link to="/">Dashboard</Link>

          <Link to="/workflow">
            Workflow Builder
          </Link>

          <Link to="/processes">
            Procesos
          </Link>

          <Link to="/automations">
            Automatizaciones
          </Link>

          <Link to="/settings">
            Configuración
          </Link>

          <button onClick={logout}>
            Logout
          </button>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;