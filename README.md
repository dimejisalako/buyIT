# Shopbrow

Nigerians paste an Amazon.com link. We buy it, consolidate it and ship it to Nigeria. Pay in naira.

## How it works

1. **Request** (`/request`): the customer pastes a link, enters price, weight and quantity, and gets an itemised estimate in USD and naira.
2. **Review** (`/admin/requests`): you check the item and set the request to **quoted**. The customer is emailed a link.
3. **Pay** (`/track/[id]`): the customer pays through Paystack. A verified payment moves the request to **paid** automatically.
4. **Fulfil**: you move it through **purchased**, **shipped** and **delivered**. Each change emails the customer.

The landing page (`/`) is the waitlist. Admin pages are at `/admin/waitlist` and `/admin/requests` and need `ADMIN_KEY`.

## Setup

```bash
cp .env.example .env.local   # fill it in
npm install
npm run dev
```

| Variable | Needed for |
| --- | --- |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Storing the waitlist and requests (required) |
| `ADMIN_KEY` | Admin pages (required; they refuse everyone without it) |
| `PAYSTACK_SECRET_KEY` | Online payment. Add the webhook `{SITE_URL}/api/paystack/webhook` in the Paystack dashboard |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL` | Email. Without a key, emails are skipped and logged |
| `SITE_URL` | Links in emails and the payment callback |
| `SERVICE_FEE_USD`, `SHIPPING_USD_PER_LB`, `US_SALES_TAX_RATE`, `DUTY_RATE`, `PAYMENT_FEE_RATE`, `NGN_PER_USD`, `FX_BUFFER_RATE` | The quote engine. **Defaults are placeholders**; set real values before charging anyone |

## Safety notes

- Customers get a secret token in their tracking link. It is required to view or pay for a request, and the tracking API never returns their contact details.
- A payment only counts if Paystack confirms it, the amount matches the quote in naira, and the reference is the latest one issued for that request. The webhook signature is checked and the transaction is re-verified with Paystack.
- Amazon links are parsed strictly (`amazon.com` and its subdomains only). Price and weight are entered by the customer and checked by you before you set **quoted**. We do not scrape Amazon.

## Scripts

`npm test` (unit tests), `npm run build`, `npm run typecheck`. CI runs tests and a build on every PR.
