// backend/server/lib/email.js
//
// Minimal wrapper around Resend's HTTP API (https://resend.com) for
// transactional email — currently just the "forgot password" link. Uses
// Node's built-in global fetch (Node 18+, matches package.json's engines
// requirement) instead of pulling in an SDK, so this adds zero dependencies.
//
// Degrades the same way lib/r2.js does: if the env vars aren't set,
// isConfigured() is false and the caller (routes/auth.js) can skip sending
// instead of crashing — so the rest of the app keeps working even before
// email is set up.
const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;

function isConfigured() {
  return Boolean(RESEND_API_KEY && RESEND_FROM_EMAIL);
}

async function sendPasswordResetEmail(to, resetUrl) {
  if (!isConfigured()) {
    throw new Error(
      "Email is not configured — set RESEND_API_KEY and RESEND_FROM_EMAIL (see DEPLOYMENT.md)."
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Reset your StreamPure password",
      html: `
        <p>Someone asked to reset the password on this StreamPure account.</p>
        <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
        <p>If this wasn't you, you can safely ignore this email — your password won't change.</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

module.exports = { isConfigured, sendPasswordResetEmail };
