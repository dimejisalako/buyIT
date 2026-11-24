import { NextResponse } from "next/server";
import { classifyAmazonUrl, guessTitle, resolveShortLink } from "../../../lib/amazon";
import { requireUser } from "../../../lib/auth";
import { notifyReceived } from "../../../lib/notify";
import { rateLimited } from "../../../lib/redis";
import { addRequest } from "../../../lib/requests";
import { orderUrl, siteUrl } from "../../../lib/site";

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

// A signed-in customer submits an Amazon link. That's all they need to do: we check the item,
// work out the price and weight, and send them a quote.
export async function POST(request: Request) {
  const user = await requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = await request.json();
    const link = classifyAmazonUrl(String(body.url ?? ""));
    if (!link) return bad("Please paste a link to a product on Amazon.com. In the Amazon app, tap Share and copy the link.");

    if (await rateLimited("requests:" + user.id, 20, 3600)) return bad("Too many requests. Please try again later.", 429);

    // Short links (a.co, amzn.to) are expanded to the real product page when possible.
    let asin = "";
    let url = link.url;
    if (link.kind === "product") {
      asin = link.asin;
    } else {
      const resolved = await resolveShortLink(link);
      if (resolved) ({ asin, url } = resolved);
    }

    const saved = await addRequest({
      userId: user.id,
      title: guessTitle(String(body.url), asin),
      asin,
      url,
      note: body.note ? String(body.note).trim().slice(0, 500) : undefined,
    });

    await notifyReceived(saved, user, orderUrl(siteUrl(request), saved.id));
    return NextResponse.json({ success: true, id: saved.id });
  } catch (error) {
    console.error("Request submit error:", error);
    return bad("Something went wrong. Please try again.", 500);
  }
}
