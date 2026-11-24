// In-memory stand-ins for Upstash Redis (REST) and Paystack, so the whole app can be tested offline.
import http from "node:http";

const b64 = (v) =>
  typeof v === "string" ? Buffer.from(v).toString("base64") : Array.isArray(v) ? v.map(b64) : v;

export function startFakeRedis(port) {
  const db = new Map(); // key -> Map | string | number
  const run = (cmd, encode) => {
    const [op, key, ...a] = cmd;
    let r = null;
    switch (String(op).toLowerCase()) {
      case "hset": {
        const m = db.get(key) ?? new Map();
        for (let i = 0; i < a.length; i += 2) m.set(a[i], a[i + 1]);
        db.set(key, m);
        r = a.length / 2;
        break;
      }
      case "hsetnx": {
        const m = db.get(key) ?? new Map();
        if (m.has(a[0])) r = 0;
        else { m.set(a[0], a[1]); db.set(key, m); r = 1; }
        break;
      }
      case "hget": r = db.get(key)?.get(a[0]) ?? null; break;
      case "hgetall": r = [...(db.get(key) ?? new Map())].flat(); break;
      case "get": r = db.get(key) ?? null; break;
      case "del": r = db.delete(key) ? 1 : 0; break;
      case "incr": { const n = (Number(db.get(key)) || 0) + 1; db.set(key, n); r = n; break; }
      case "expire": r = 1; break;
      case "set": {
        const nx = a.map((x) => String(x).toLowerCase()).includes("nx");
        if (nx && db.has(key)) r = null;
        else { db.set(key, a[0]); r = "OK"; }
        break;
      }
      default: r = null;
    }
    return { result: encode ? b64(r) : r };
  };
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      const parsed = JSON.parse(body);
      const encode = req.headers["upstash-encoding"] === "base64";
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(req.url.includes("pipeline") ? parsed.map((c) => run(c, encode)) : run(parsed, encode)));
    });
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

export function startFakePaystack(port) {
  const txns = new Map();
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      if (req.url === "/transaction/initialize") {
        const b = JSON.parse(body);
        txns.set(b.reference, { status: "abandoned", reference: b.reference, amount: b.amount, currency: b.currency, metadata: b.metadata });
        return res.end(JSON.stringify({ status: true, data: { authorization_url: "https://checkout.example/" + b.reference, reference: b.reference } }));
      }
      if (req.url.startsWith("/transaction/verify/")) {
        const t = txns.get(decodeURIComponent(req.url.split("/").pop()));
        return res.end(JSON.stringify(t ? { status: true, data: t } : { status: false, message: "not found" }));
      }
      // Test controls: mark a transaction successful, or tamper with its amount.
      if (req.url.startsWith("/__succeed/")) { txns.get(req.url.split("/").pop()).status = "success"; return res.end("{}"); }
      if (req.url.startsWith("/__amount/")) { txns.get(req.url.split("/").pop()).amount = 100; return res.end("{}"); }
      res.statusCode = 404;
      res.end("{}");
    });
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
