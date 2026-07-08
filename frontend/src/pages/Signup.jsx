import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, error, setError } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSignup(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setSubmitting(true);
    setError("");
    const ok = await signup(form.email, form.password, form.name);
    setSubmitting(false);
    if (ok) navigate("/profile");
  }

  return (
    <section className="grid place-items-center py-10">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="mt-2 text-sm muted">Join the clean-music movement.</p>
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <input name="name" placeholder="Name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight" value={form.name} onChange={onChange} required />
          <input name="email" type="email" placeholder="Email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight" value={form.email} onChange={onChange} required />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-highlight" value={form.password} onChange={onChange} required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary w-full disabled:opacity-60" disabled={submitting}>
            {submitting ? "Creating account…" : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button onClick={()=>navigate("/login")} className="font-semibold text-highlight hover:underline">
            Log in
          </button>
        </p>
      </div>
    </section>
  );
}
