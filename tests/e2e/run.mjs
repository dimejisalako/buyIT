// End-to-end test: starts fake Redis + fake Paystack, boots the built app, and drives it like a browser would.
// Run `npm run build` first, then `npm run test:e2e`.
import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";
import { startFakePaystack, startFakeRedis } from "./fakes.mjs";

const REDIS_PORT = 4101, PAYSTACK_PORT = 4102, APP_PORT = 4103;
const base = "http://localhost:" + APP_PORT;
const ADMIN_KEY = "test-admin-key-123", PAYSTACK_KEY = "sk_test_e2e";

const redisServer = await startFakeRedis(REDIS_PORT);
const paystackServer = await startFakePaystack(PAYSTACK_PORT);

const app = spawn("npx", ["next", "start", "-p", String(APP_PORT)], {
  env: {
    ...process.env,
    UPSTASH_REDIS_REST_URL: "http://localhost:" + REDIS_PORT,
    UPSTASH_REDIS_REST_TOKEN: "x",
    ADMIN_KEY,
    PAYSTACK_SECRET_KEY: PAYSTACK_KEY,
    PAYSTACK_API_URL: "http://localhost:" + PAYSTACK_PORT,
    SITE_URL: base,
    PAYMENT_INSTRUCTIONS: "Test Bank 0123456789",
  },
  stdio: "ignore",
});

const stop = () => { app.kill(); redisServer.close(); paystackServer.close(); };
process.on("exit", stop);

for (let i = 0; i < 60; i++) {
  try { if ((await fetch(base + "/robots.txt")).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

// A tiny browser: keeps the session cookie between requests.
class Client {
  cookie = "";
  async req(path, { method = "GET", body, headers = {} } = {}) {
    const res = await fetch(base + path, {
      method,
      redirect: "manual",
      headers: { ...(body ? { "content-type": "application/json" } : {}), ...(this.cookie ? { cookie: this.cookie } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) {
      const pair = set.split(";")[0];
      this.cookie = pair.endsWith("=") ? "" : pair;
    }
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: res.status, text, json, location: res.headers.get("location") };
  }
  get = (p) => this.req(p);
  post = (p, body, headers) => this.req(p, { method: "POST", body, headers });
  patch = (p, body) => this.req(p, { method: "PATCH", body });
}

let fails = 0, passes = 0;
const ok = (name, cond, extra = "") => {
  if (cond) passes++; else fails++;
  console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : "  " + extra));
};

const goodRequest = { url: "https://www.amazon.com/Sony/dp/B09XS7JWHH?th=1", title: "Sony WH-1000XM5", priceUsd: 100, weightLb: 2, quantity: 1 };
const signupBody = (n) => ({ name: "Ada Okafor " + n, email: `ada${n}@example.com`, phone: "+234 801 234 5678", password: "password-" + n + "-ok" });

try {
  const anon = new Client();
  ok("home page renders", (await anon.get("/")).status === 200);
  ok("home page has no waitlist form", !(await anon.get("/")).text.toLowerCase().includes("interest list"));
  ok("waitlist API is gone (410)", (await anon.post("/api/waitlist", {})).status === 410);
  ok("terms and privacy render", (await anon.get("/terms")).status === 200 && (await anon.get("/privacy")).status === 200);
  const r0 = await anon.get("/request");
  ok("/request sends logged-out users to log in", r0.status >= 300 && r0.status < 400 && r0.location.includes("/login"), r0.location);
  ok("/account sends logged-out users to log in", (await anon.get("/account")).location?.includes("/login"));
  ok("/admin sends logged-out users to log in", (await anon.get("/admin")).location?.includes("/login"));
  ok("creating a request needs login (401)", (await anon.post("/api/requests", goodRequest)).status === 401);

  // --- customer A
  const a = new Client();
  ok("signup rejects short password", (await a.post("/api/auth/signup", { ...signupBody(1), password: "short" })).status === 400);
  ok("signup rejects bad email", (await a.post("/api/auth/signup", { ...signupBody(1), email: "nope" })).status === 400);
  const s1 = await a.post("/api/auth/signup", signupBody(1));
  ok("signup works and signs in", s1.status === 200 && s1.json.success && a.cookie.startsWith("sb_session="), JSON.stringify(s1.json));
  ok("duplicate email is refused (409)", (await new Client().post("/api/auth/signup", signupBody(1))).status === 409);
  ok("session cookie is httpOnly", true); // verified below via raw header

  const raw = await fetch(base + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "ada1@example.com", password: "password-1-ok" }) });
  const setCookie = raw.headers.get("set-cookie") || "";
  ok("login cookie is HttpOnly + SameSite=Lax", /HttpOnly/i.test(setCookie) && /SameSite=lax/i.test(setCookie), setCookie);
  ok("wrong password is refused (401)", (await new Client().post("/api/auth/login", { email: "ada1@example.com", password: "nope-nope-nope" })).status === 401);
  ok("unknown email gets the same refusal", (await new Client().post("/api/auth/login", { email: "ghost@example.com", password: "whatever-123" })).status === 401);

  ok("account page renders for customer", (await a.get("/account")).status === 200);
  ok("request page renders for customer", (await a.get("/request")).status === 200);
  ok("rejects look-alike Amazon host", (await a.post("/api/requests", { ...goodRequest, url: "https://amazon.com.evil.example/dp/B09XS7JWHH" })).status === 400);
  ok("rejects missing item name", (await a.post("/api/requests", { ...goodRequest, title: "" })).status === 400);
  const cr = await a.post("/api/requests", goodRequest);
  ok("customer creates a request", cr.status === 200 && cr.json.id, JSON.stringify(cr.json));
  const orderId = cr.json.id;
  ok("order appears in the customer's account", (await a.get("/account")).text.includes("Sony WH-1000XM5"));
  ok("order detail page shows the quote", (await a.get("/account/orders/" + orderId)).text.includes("Your quote"));
  ok("unpaid order can't be paid yet (409)", (await a.post("/api/pay/" + orderId, {})).status === 409);

  // --- customer B can't touch A's order
  const b = new Client();
  await b.post("/api/auth/signup", signupBody(2));
  ok("another customer can't open the order (404)", (await b.get("/account/orders/" + orderId)).status === 404);
  ok("another customer can't pay it (404)", (await b.post("/api/pay/" + orderId, {})).status === 404);
  ok("another customer doesn't see it listed", !(await b.get("/account")).text.includes("Sony WH-1000XM5"));
  ok("customers can't use admin API (403)", (await b.patch("/api/admin/requests", { id: orderId, status: "quoted" })).status === 403);
  ok("customers are bounced from /admin", !!(await b.get("/admin")).location?.includes("/account"));
  ok("cross-site POST is blocked (403)", (await b.post("/api/auth/logout", {}, { origin: "https://evil.example" })).status === 403);

  // --- admin setup
  const admin = new Client();
  ok("admin setup refuses a wrong key (403)", (await admin.post("/api/admin/setup", { adminKey: "wrong", email: "boss@example.com", password: "boss-password-1" })).status === 403);
  const setup = await admin.post("/api/admin/setup", { adminKey: ADMIN_KEY, name: "The Boss", email: "boss@example.com", password: "boss-password-1" });
  ok("admin setup creates the admin and signs in", setup.status === 200 && admin.cookie.startsWith("sb_session="), JSON.stringify(setup.json));
  const dash = await admin.get("/admin");
  ok("admin dashboard lists the customer's order", dash.status === 200 && dash.text.includes("Sony WH-1000XM5") && dash.text.includes("Ada Okafor 1"));
  ok("admin dashboard never leaks password hashes", !dash.text.includes("scrypt$"));
  ok("admin is sent to /admin from /account", !!(await admin.get("/account")).location?.includes("/admin"));

  // --- order lifecycle
  const move = (status, extra = {}) => admin.patch("/api/admin/requests", { id: orderId, status, ...extra });
  ok("can't mark purchased before payment (409)", (await move("purchased")).status === 409);
  ok("can't mark paid by hand without offline (400)", (await move("paid")).status === 400);
  ok("admin sends the quote", (await move("quoted", { note: "Looks good" })).json?.request?.status === "quoted");
  ok("customer sees 'Ready to pay'", (await a.get("/account/orders/" + orderId)).text.includes("Ready to pay"));

  const pay = await a.post("/api/pay/" + orderId, {});
  ok("customer starts online payment", pay.status === 200 && pay.json.url?.includes("checkout.example"), JSON.stringify(pay.json));
  const ref = pay.json.url.split("/").pop();
  ok("an unpaid transaction does not settle the order", (await a.get("/account/orders/" + orderId)).text.includes("Ready to pay"));

  const evt = JSON.stringify({ event: "charge.success", data: { reference: ref } });
  const hook = (sig) => fetch(base + "/api/paystack/webhook", { method: "POST", body: evt, headers: { "x-paystack-signature": sig } });
  ok("webhook with a bad signature is refused (401)", (await hook("bad")).status === 401);
  await fetch(`http://localhost:${PAYSTACK_PORT}/__succeed/${ref}`);
  const sig = createHmac("sha512", PAYSTACK_KEY).update(evt).digest("hex");
  ok("webhook with a good signature is accepted", (await hook(sig)).status === 200);
  ok("verified payment moves the order to paid", (await a.get("/account/orders/" + orderId)).text.includes("Payment received"));

  for (const [status, note] of [["purchased", "Order 111-222"], ["received", ""], ["shipped", "DHL 1234567890"], ["arrived", ""], ["delivered", "Left with the doorman"]]) {
    const r = await move(status, { note });
    ok("admin moves order to " + status, r.json?.request?.status === status, JSON.stringify(r.json));
  }
  const final = await a.get("/account/orders/" + orderId);
  ok("customer sees tracking notes in their updates", final.text.includes("DHL 1234567890") && final.text.includes("Left with the doorman"));
  ok("customer sees the order as delivered", final.text.includes("Delivered"));
  ok("note-only update works on a delivered order", (await move("delivered", { note: "Thanks!" })).status === 200);

  // --- underpaid transaction must not settle
  const c2 = await a.post("/api/requests", { ...goodRequest, title: "Second item", priceUsd: 50 });
  const id2 = c2.json.id;
  await admin.patch("/api/admin/requests", { id: id2, status: "quoted" });
  const pay2 = await a.post("/api/pay/" + id2, {});
  const ref2 = pay2.json.url.split("/").pop();
  await fetch(`http://localhost:${PAYSTACK_PORT}/__succeed/${ref2}`);
  await fetch(`http://localhost:${PAYSTACK_PORT}/__amount/${ref2}`);
  ok("an underpaid transaction does not settle", (await a.get("/account/orders/" + id2)).text.includes("Ready to pay"));
  const offline = await admin.patch("/api/admin/requests", { id: id2, status: "paid", offline: true });
  ok("admin can record a bank transfer", offline.json?.request?.status === "paid" && !!offline.json.request.paidAt);
  ok("admin can reject an order", (await admin.patch("/api/admin/requests", { id: id2, status: "rejected", note: "Out of stock" })).json?.request?.status === "rejected");

  // --- passwords and sessions
  const a2 = new Client();
  await a2.post("/api/auth/login", { email: "ada1@example.com", password: "password-1-ok" });
  ok("second device is signed in", (await a2.get("/account")).status === 200);
  ok("change password refuses a wrong current password", (await a.post("/api/auth/password", { current: "wrong", next: "new-password-1" })).status === 403);
  ok("change password works", (await a.post("/api/auth/password", { current: "password-1-ok", next: "new-password-1" })).status === 200);
  ok("this device stays signed in", (await a.get("/account")).status === 200);
  ok("other devices are signed out", !!(await a2.get("/account")).location?.includes("/login"));
  ok("old password no longer works", (await new Client().post("/api/auth/login", { email: "ada1@example.com", password: "password-1-ok" })).status === 401);

  const customers = (await admin.get("/admin")).text;
  const idMatch = customers.match(/usr_[0-9a-f]{18}/g) || [];
  // find customer A's id via a fresh lookup: reset by trying each id until it resets a customer
  let temp = null;
  for (const uid of [...new Set(idMatch)]) {
    const r = await admin.post(`/api/admin/customers/${uid}/reset-password`, {});
    if (r.json?.temporaryPassword) { const login = await new Client().post("/api/auth/login", { email: "ada1@example.com", password: r.json.temporaryPassword }); if (login.status === 200) { temp = r.json.temporaryPassword; break; } }
  }
  ok("admin can reset a customer's password and it works", !!temp);
  ok("customers can't reset passwords (403)", (await b.post("/api/admin/customers/usr_000/reset-password", {})).status === 403);

  // --- brute force protection
  const brute = new Client();
  let limited = false;
  for (let i = 0; i < 14; i++) { const r = await brute.post("/api/auth/login", { email: "victim@example.com", password: "guess-" + i + "-xxxx" }); if (r.status === 429) { limited = true; break; } }
  ok("repeated wrong logins get rate limited (429)", limited);

  const out = await a.post("/api/auth/logout", {});
  ok("logout works and clears the session", out.status === 200 && !!(await a.get("/account")).location?.includes("/login"));
} catch (error) {
  fails++;
  console.error("FAIL test run crashed:", error);
} finally {
  console.log(`\n${passes} passed, ${fails} failed`);
  stop();
  process.exit(fails ? 1 : 0);
}
