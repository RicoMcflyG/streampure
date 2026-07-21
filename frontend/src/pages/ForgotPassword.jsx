import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Deliberately generic — the backend gives the same response whether or
  // not the email has an account, so the UI shouldn't imply otherwise.
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setLocalError("");
    const { ok, message } = await forgotPassword(email);
    setSubmitting(false);
    if (ok) {
      setSent(true);
    } else {
      setLocalError(message);
    }
  }

  return (
    <section className="grid place-items-center py-10">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-bold">Reset your password</h2>
        <p className="mt-2 text-sm muted">
          Enter the email on your account and we'll send you a link to set a new password.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              If an account exists for <span className="font-semibold">{email}</span>, a reset
              link is on its way. It expires in 1 hour.
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary w-full">
              Back to log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {localError && <p className="text-sm text-red-400">{localError}</p>}
            <button className="btn-primary w-full disabled:opacity-60" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm">
          <button onClick={() => navigate("/login")} className="font-semibold text-highlight hover:underline">
            Back to log in
          </button>
        </p>
      </div>
    </section>
  );
}
