import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Automations from "../pages/Automations";
import Settings from "../pages/Settings";
import Workflow from "../pages/Workflow";
import WorkflowDebugger from "../pages/WorkflowDebugger";


import Login from "../pages/Login";
import Register from "../pages/Register";

import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/automations"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Automations />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflow"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Workflow />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workflows/executions/:id/debug"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WorkflowDebugger />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
