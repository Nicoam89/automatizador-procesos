import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function MainLayout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-60 bg-[#114185] text-white p-5">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Logo principal"
            className="h-9 w-9 rounded bg-white p-1"
          />
          <img
            src="/icons.svg"
            alt="Logo secundario"
            className="h-9 w-9 rounded bg-white p-1"
          />
        </div>

        <h2 className="mb-6 text-xl font-semibold">Automatizador</h2>

        <p className="mb-6 text-sm text-blue-100">{user?.name}</p>

        <nav className="flex flex-col gap-4">
          <Link className="transition hover:opacity-80" to="/">
            Dashboard
          </Link>

          <Link className="transition hover:opacity-80" to="/workflow">
            Workflow Builder
          </Link>

          <Link className="transition hover:opacity-80" to="/processes">
            Procesos
          </Link>

          <Link className="transition hover:opacity-80" to="/automations">
            Automatizaciones
          </Link>

          <Link className="transition hover:opacity-80" to="/settings">
            Configuración
          </Link>

          <button
            onClick={logout}
            className="mt-3 rounded bg-white px-3 py-2 text-left text-sm font-medium text-[#114185] transition hover:bg-blue-50"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-white p-8">{children}</main>
    </div>
  );
}

export default MainLayout;
