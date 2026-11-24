export const siteUrl = (request?: Request): string =>
  (process.env.SITE_URL || (request ? new URL(request.url).origin : "http://localhost:3000")).replace(/\/$/, "");

export const orderUrl = (base: string, id: string) => base + "/account/orders/" + id;

// Optional contact details shown in the footer and legal pages.
export const contact = () => ({
  email: process.env.SUPPORT_EMAIL || "",
  whatsapp: (process.env.WHATSAPP_NUMBER || "").replace(/[^\d]/g, ""),
});
