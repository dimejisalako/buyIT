# Shopbrow

Nigerians paste an Amazon.com link. We buy it, ship it to Nigeria and track it to their door. They pay in naira.

## How it works

1. **Sign up.** Customers create an account (name, email, phone, password).
2. **Request** (`/request`). They paste an Amazon link. That's all (an optional note for size or colour). Short links from the Amazon app (`a.co`, `amzn.to`) work too.
3. **Quote** (`/admin`). You open the link, then enter the item name, price, weight and quantity. A live preview shows the customer's total in naira. Press **Send quote** and the customer is emailed. You can update and re-send the quote until it's paid.
4. **Pay.** On their order page the customer pays through Paystack, or by bank transfer using the details in `PAYMENT_INSTRUCTIONS`. A verified Paystack payment marks the order paid automatically. For a bank transfer, press **Mark payment received** once the money arrives.
5. **Fulfil.** In `/admin`, press the next button as the order moves: **Mark purchased**, **Mark received in US**, **Mark shipped**, **Mark arrived in Nigeria**, **Mark delivered**. Add a note (such as a carrier and tracking number) and the customer sees it in their account and by email.

Customers see all their orders and the full update history at `/account`.

## First-time setup

1. Copy `.env.example` to `.env.local` and fill it in (see the table below), or set the same variables in Vercel.
2. `npm install` then `npm run dev` (or deploy).
3. Open `/admin/setup`, enter your `ADMIN_KEY`, and create the admin account. You can use the same page later to reset the admin password.
4. Log in at `/login`. Admins land on `/admin`.

| Variable | Needed for |
| --- | --- |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | The database (required) |
| `ADMIN_KEY` | Creating or resetting the admin account (required) |
| `SITE_URL` | Links in emails, payment callbacks, sitemap (required in production) |
| `SERVICE_FEE_USD`, `SHIPPING_USD_PER_LB`, `US_SALES_TAX_RATE`, `DUTY_RATE`, `PAYMENT_FEE_RATE`, `NGN_PER_USD`, `FX_BUFFER_RATE` | The quote engine. **Defaults are placeholders**; set real values before charging anyone |
| `PAYMENT_INSTRUCTIONS` | Bank-transfer details shown on quoted orders while Paystack is off |
| `PAYSTACK_SECRET_KEY` | Online payment. Add the webhook `{SITE_URL}/api/paystack/webhook` in Paystack |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL` | Email. Without a key, emails are skipped and logged |
| `SUPPORT_EMAIL`, `WHATSAPP_NUMBER` | Contact details in the footer and legal pages |

## Safety notes

- Passwords are stored as salted scrypt hashes. Sessions are random tokens kept server-side, sent in an HttpOnly, SameSite=Lax cookie, and expire after 30 days. Changing or resetting a password signs the user out everywhere.
- Logins, signups, payments and admin setup are rate limited. Cross-site form posts are rejected.
- A customer can only see and pay for their own orders. Admin pages and routes require an admin account.
- A payment only counts if Paystack confirms it, the amount matches the quote in naira, and the reference is the latest issued for that order. The webhook signature is checked and the transaction is re-verified with Paystack.
- Orders can't be marked purchased or shipped before they are paid, and **paid** can't be set by hand except as an explicit bank transfer.
- Amazon links are parsed strictly (`amazon.com` and its subdomains, plus the `a.co`/`amzn.to` short links). Price and weight are entered by you, the admin, after checking the item. We do not scrape Amazon.

## Known limits

- No self-service password reset yet (needs email). Admins reset a customer's password from the Customers tab.
- Orders are listed by scanning all orders. That's fine for launch; add per-user indexes when volume grows.

## Scripts

`npm test` (unit tests), `npm run build`, `npm run test:e2e` (boots the built app against fake Redis and Paystack servers and drives the whole flow; run `npm run build` first), `npm run typecheck`. CI runs all of these on every PR.
