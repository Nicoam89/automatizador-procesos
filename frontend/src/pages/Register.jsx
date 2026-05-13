import { useState } from "react";

import api from "../api/axios";

import { useAuth } from "../context/AuthContext";

import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await api.post(
        "/api/auth/register",
        form
      );

      login(response.data);

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No fue posible crear la cuenta"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Registro</h1>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit">Registrarse</button>

          {error && (
            <p className="auth-error">{error}</p>
          )}
        </form>

        <p className="auth-footnote">
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
