import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQuote } from "../src/lib/quote.ts";
import { parseAmazonUrl } from "../src/lib/amazon.ts";

test("quote lines add up to the total and naira uses the buffered rate", () => {
  const q = buildQuote({ itemPriceUsd: 100, weightLb: 2 });
  const sum = Math.round(q.lines.reduce((s, l) => s + l.usd, 0) * 100) / 100;
  assert.equal(q.totalUsd, sum);
  assert.equal(q.totalNgn, Math.round(q.totalUsd * q.ngnPerUsd));
  assert.ok(q.ngnPerUsd > 1550);
});

test("quantity scales goods, shipping and service fee", () => {
  const one = buildQuote({ itemPriceUsd: 50, weightLb: 1, quantity: 1 });
  const three = buildQuote({ itemPriceUsd: 50, weightLb: 1, quantity: 3 });
  assert.ok(Math.abs(three.totalUsd - one.totalUsd * 3) < 0.05);
});

test("parses dp and gp/product links to a canonical URL", () => {
  assert.equal(parseAmazonUrl("https://www.amazon.com/Some-Name/dp/B09XS7JWHH/ref=sr_1_1?th=1")?.url, "https://www.amazon.com/dp/B09XS7JWHH");
  assert.equal(parseAmazonUrl("https://amazon.com/gp/product/b09xs7jwhh")?.asin, "B09XS7JWHH");
});

test("rejects look-alike hosts, bad schemes and non-product pages", () => {
  for (const u of [
    "https://amazon.com.evil.example/dp/B09XS7JWHH",
    "https://evilamazon.com/dp/B09XS7JWHH",
    "javascript:alert(1)",
    "https://www.amazon.com/s?k=headphones",
    "not a url",
  ]) assert.equal(parseAmazonUrl(u), null, u);
});
