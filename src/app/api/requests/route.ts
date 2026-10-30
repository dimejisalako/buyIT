import { NextRequest, NextResponse } from "next/server";
import { parseAmazonUrl } from "../../../lib/amazon";
import { buildQuote } from "../../../lib/quote";
import { addRequest, rateLimited } from "../../../lib/requests";
import { notifyReceived } from "../../../lib/notify";
import { siteUrl, trackUrl } from "../../../lib/site";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const link = parseAmazonUrl(String(body.url ?? ""));
    if (!link) return bad("Please paste a link to an Amazon.com product page.");

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Please enter your name and a valid email.");

    const price = Number(body.priceUsd);
    const weight = Number(body.weightLb);
    const quantity = Number(body.quantity ?? 1);
    if (!(price > 0 && price < 10000)) return bad("Please enter the item price in USD.");
    if (!(weight > 0 && weight < 150)) return bad("Please enter the approximate weight in pounds.");
    if (!(Number.isInteger(quantity) && quantity >= 1 && quantity <= 20)) return bad("Quantity must be between 1 and 20.");

    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (await rateLimited(`requests:${ip}`, 10, 3600)) return bad("Too many requests. Please try again later.", 429);

    const quote = buildQuote({ itemPriceUsd: price, weightLb: weight, quantity });
    const saved = await addRequest({
      asin: link.asin,
      url: link.url,
      name: name.slice(0, 100),
      email,
      phone: body.phone ? String(body.phone).trim().slice(0, 30) : undefined,
      note: body.note ? String(body.note).trim().slice(0, 500) : undefined,
      quote,
    });

    const track = trackUrl(siteUrl(request), saved.id, saved.token);
    await notifyReceived(saved, track);
    return NextResponse.json({ success: true, id: saved.id, track, quote });
  } catch (error) {
    console.error("Request submit error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
