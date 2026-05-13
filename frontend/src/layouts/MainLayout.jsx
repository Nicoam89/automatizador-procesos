import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function MainLayout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand-icons">
          <img
            src="/favicon.svg"
            alt="Logo principal"
            className="app-brand-icon"
          />
          <img
            src="/icons.svg"
            alt="Logo secundario"
            className="app-brand-icon"
          />
        </div>

        <h2 className="app-title">Automatizador</h2>

        <p className="app-user-name">{user?.name}</p>

        <nav className="app-nav">
          <Link className="app-nav-link" to="/">
            Dashboard
          </Link>

          <Link className="app-nav-link" to="/workflow">
            Workflow Builder
          </Link>

          <Link className="app-nav-link" to="/processes">
            Procesos
          </Link>

          <Link className="app-nav-link" to="/automations">
            Automatizaciones
          </Link>

          <Link className="app-nav-link" to="/settings">
            Configuración
          </Link>

          <button onClick={logout} className="app-logout-btn">
            Logout
          </button>
        </nav>
      </aside>

      <main className="app-content">{children}</main>
    </div>
  );
}

export default MainLayout;
