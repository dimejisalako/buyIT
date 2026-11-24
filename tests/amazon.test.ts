import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyAmazonUrl, guessTitle, parseAmazonUrl } from "../src/lib/amazon.ts";
import { transitionError } from "../src/lib/status.ts";

test("full product links become a canonical URL and ASIN", () => {
  const link = classifyAmazonUrl("https://www.amazon.com/Sony-WH-1000XM5/dp/B09XS7JWHH/ref=sr_1_1?th=1");
  assert.deepEqual(link, { kind: "product", asin: "B09XS7JWHH", url: "https://www.amazon.com/dp/B09XS7JWHH" });
  assert.equal(parseAmazonUrl("https://smile.amazon.com/gp/product/b09xs7jwhh")?.asin, "B09XS7JWHH");
});

test("short links from the Amazon app are recognised", () => {
  assert.equal(classifyAmazonUrl("https://a.co/d/abc123")?.kind, "short");
  assert.equal(classifyAmazonUrl("https://amzn.to/3xYz")?.kind, "short");
  assert.equal(classifyAmazonUrl("http://www.amzn.to/3xYz?x=1")?.kind, "short");
  assert.equal(parseAmazonUrl("https://a.co/d/abc123"), null); // short links need resolving first
});

test("look-alike hosts, bare short-link domains and non-product pages are rejected", () => {
  for (const u of [
    "https://a.co.evil.example/d/abc",
    "https://evil-a.co/d/abc",
    "https://amzn.to.evil.example/abc",
    "https://a.co/",
    "https://amazon.com.evil.example/dp/B09XS7JWHH",
    "https://evilamazon.com/dp/B09XS7JWHH",
    "https://www.amazon.com/s?k=headphones",
    "https://www.amazon.com/",
    "javascript:alert(1)",
    "not a url",
    "",
  ]) assert.equal(classifyAmazonUrl(u), null, u);
});

test("a readable item name is guessed from the link", () => {
  assert.equal(guessTitle("https://www.amazon.com/Sony-WH-1000XM5-Headphones/dp/B09XS7JWHH", "B09XS7JWHH"), "Sony WH 1000XM5 Headphones");
  assert.equal(guessTitle("https://www.amazon.com/dp/B09XS7JWHH", "B09XS7JWHH"), "Amazon item B09XS7JWHH");
  assert.equal(guessTitle("https://a.co/d/abc123"), "Amazon item");
  assert.ok(guessTitle("https://www.amazon.com/" + "x".repeat(300) + "/dp/B09XS7JWHH", "B09XS7JWHH").length <= 120);
});

test("a quote can't be sent until the price and weight are in", () => {
  assert.ok(transitionError({ status: "new", hasQuote: false }, "quoted"));
  assert.equal(transitionError({ status: "new", hasQuote: true }, "quoted"), null);
  assert.equal(transitionError({ status: "quoted", hasQuote: true }, "quoted"), null); // re-quoting
});
