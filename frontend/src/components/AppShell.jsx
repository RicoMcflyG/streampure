import React from "react";
import Nav from "./Nav";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen relative">
      {/* Soft neon gradient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute top-64 -left-32 h-[28rem] w-[28rem] rounded-full bg-highlight/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-12 pt-8 text-sm text-white/60">
        © {new Date().getFullYear()} StreamPure — Clean music. Pure vibes.
      </footer>
    </div>
  );
}
