import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setError("");
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate("/profile");
  }

  return (
    <section className="grid place-items-center py-10">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-bold">Login to StreamPure</h2>
        <p className="mt-2 text-sm muted">Welcome back. Let’s catch a vibe.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight"
            value={email} onChange={(e)=>setEmail(e.target.value)} required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight"
            value={password} onChange={(e)=>setPassword(e.target.value)} required
          />
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={()=>navigate("/forgot-password")}
              className="text-sm text-white/50 hover:text-highlight hover:underline"
            >
              Forgot password?
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary w-full disabled:opacity-60" disabled={submitting}>
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          New here?{" "}
          <button onClick={()=>navigate("/signup")} className="font-semibold text-highlight hover:underline">
            Create an account
          </button>
        </p>
      </div>
    </section>
  );
}
