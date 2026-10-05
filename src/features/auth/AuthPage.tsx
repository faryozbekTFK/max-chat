import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/auth.store";
import type { Credentials } from "../../types/chat";
import { BASE_URL } from "../../helper/api";
import { useAuth } from "./api/authApi";

export function AuthPage() {
  const navigate = useNavigate();
  const credentials = useAuthStore((state) => state.credentials);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>({
    defaultValues: {
      apiUrl: BASE_URL || "https://api.green-api.com",
      idInstance: "",
      apiTokenInstance: "",
    },
  });

  const auth = useAuth();

  useEffect(() => {
    if (credentials) navigate("/", { replace: true });
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">M</div>
        <h1>MAX Chat</h1>
        <p className="muted">Connect your GREEN-API instance</p>

        <form
          onSubmit={handleSubmit((credentials) => auth.mutate(credentials))}
          className="form"
        >
          <label>
            API URL
            <input
              {...register("apiUrl", { required: "API URL is required" })}
              placeholder="https://api.green-api.com"
            />
            {errors.apiUrl && (
              <span className="field-error">{errors.apiUrl.message}</span>
            )}
          </label>
          <label>
            ID Instance
            <input
              {...register("idInstance", {
                required: "ID Instance is required",
              })}
              placeholder="1101xxxxxxxx"
            />
            {errors.idInstance && (
              <span className="field-error">{errors.idInstance.message}</span>
            )}
          </label>
          <label>
            API Token Instance
            <input
              type="password"
              {...register("apiTokenInstance", {
                required: "API token is required",
              })}
              placeholder="••••••••••••"
            />
            {errors.apiTokenInstance && (
              <span className="field-error">
                {errors.apiTokenInstance.message}
              </span>
            )}
          </label>
          <button className="primary-button" type="submit">
            {auth.isPending ? "Connecting..." : "Connect"}
          </button>
        </form>

        <p className="security-note">
          For this test assignment credentials are stored locally in your
          browser.
        </p>
      </section>
    </main>
  );
}
