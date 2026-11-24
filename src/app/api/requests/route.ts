import { NextResponse } from "next/server";
import { parseAmazonUrl } from "../../../lib/amazon";
import { requireUser } from "../../../lib/auth";
import { notifyReceived } from "../../../lib/notify";
import { buildQuote } from "../../../lib/quote";
import { rateLimited } from "../../../lib/redis";
import { addRequest } from "../../../lib/requests";
import { orderUrl, siteUrl } from "../../../lib/site";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// A signed-in customer submits an Amazon link with the price and weight they read off the page.
export async function POST(request: Request) {
  const user = await requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = await request.json();
    const link = parseAmazonUrl(String(body.url ?? ""));
    if (!link) return bad("Please paste a link to an Amazon.com product page.");

    const title = String(body.title ?? "").trim();
    if (title.length < 2 || title.length > 120) return bad("Please enter the name of the item.");

    const price = Number(body.priceUsd);
    const weight = Number(body.weightLb);
    const quantity = Number(body.quantity ?? 1);
    if (!(price > 0 && price < 10000)) return bad("Please enter the item price in USD.");
    if (!(weight > 0 && weight < 150)) return bad("Please enter the approximate weight in pounds.");
    if (!(Number.isInteger(quantity) && quantity >= 1 && quantity <= 20)) return bad("Quantity must be between 1 and 20.");

    if (await rateLimited("requests:" + user.id, 20, 3600)) return bad("Too many requests. Please try again later.", 429);

    const quote = buildQuote({ itemPriceUsd: price, weightLb: weight, quantity });
    const saved = await addRequest({
      userId: user.id,
      title,
      asin: link.asin,
      url: link.url,
      note: body.note ? String(body.note).trim().slice(0, 500) : undefined,
      quote,
    });

    await notifyReceived(saved, user, orderUrl(siteUrl(request), saved.id));
    return NextResponse.json({ success: true, id: saved.id });
  } catch (error) {
    console.error("Request submit error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
