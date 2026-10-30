// Sends email through Resend's HTTP API. Never throws: without RESEND_API_KEY it logs and returns false,
// so the rest of the flow keeps working before email is configured.
export async function sendEmail(opts: { to: string; subject: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY not set; skipped "${opts.subject}" to ${opts.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Shopbrow <onboarding@resend.dev>",
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) console.error("[email] send failed:", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("[email] send error:", error);
    return false;
  }
}
