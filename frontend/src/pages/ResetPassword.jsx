import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState("");

  // No token in the URL at all (e.g. someone navigated here directly) —
  // nothing to submit, so don't show a form that can only ever fail.
  if (!token) {
    return (
      <section className="grid place-items-center py-10">
        <div className="w-full max-w-md card p-8 text-center">
          <h2 className="text-2xl font-bold">Invalid reset link</h2>
          <p className="mt-2 text-sm muted">
            This link is missing its reset token. Request a new one below.
          </p>
          <button onClick={() => navigate("/forgot-password")} className="btn-primary mt-6 w-full">
            Request a new link
          </button>
        </div>
      </section>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { ok, message } = await resetPassword(token, password);
    setSubmitting(false);
    if (ok) {
      setDone(true);
    } else {
      setLocalError(message);
    }
  }

  return (
    <section className="grid place-items-center py-10">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-bold">Set a new password</h2>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              Your password has been updated.
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary w-full">
              Log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {localError && <p className="text-sm text-red-400">{localError}</p>}
            <button className="btn-primary w-full disabled:opacity-60" disabled={submitting}>
              {submitting ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
