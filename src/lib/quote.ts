// Quote engine. All rates are env-configurable; the defaults are PLACEHOLDERS to be replaced
// with real freight, duty and FX numbers before any customer is charged.
const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const rates = () => ({
  serviceFeeUsd: num(process.env.SERVICE_FEE_USD, 1.5),
  shippingUsdPerLb: num(process.env.SHIPPING_USD_PER_LB, 8),
  usSalesTaxRate: num(process.env.US_SALES_TAX_RATE, 0.07),
  dutyRate: num(process.env.DUTY_RATE, 0.2),
  paymentFeeRate: num(process.env.PAYMENT_FEE_RATE, 0.02),
  ngnPerUsd: num(process.env.NGN_PER_USD, 1550),
  fxBufferRate: num(process.env.FX_BUFFER_RATE, 0.03),
});

export interface Quote {
  itemPriceUsd: number;
  weightLb: number;
  quantity: number;
  lines: { label: string; usd: number }[];
  totalUsd: number;
  totalNgn: number;
  ngnPerUsd: number;
}

const cents = (n: number) => Math.round(n * 100) / 100;

export function buildQuote(input: { itemPriceUsd: number; weightLb: number; quantity?: number }): Quote {
  const r = rates();
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  const goods = input.itemPriceUsd * quantity;
  const weight = input.weightLb * quantity;

  const subtotalBeforeFees =
    goods + goods * r.usSalesTaxRate + weight * r.shippingUsdPerLb + goods * r.dutyRate + r.serviceFeeUsd * quantity;
  const paymentFee = subtotalBeforeFees * r.paymentFeeRate;

  const lines = [
    { label: "Item price", usd: goods },
    { label: "US sales tax (est.)", usd: goods * r.usSalesTaxRate },
    { label: "Shipping to Nigeria (by weight)", usd: weight * r.shippingUsdPerLb },
    { label: "Import duty (est.)", usd: goods * r.dutyRate },
    { label: "Shopbrow service fee", usd: r.serviceFeeUsd * quantity },
    { label: "Payment processing", usd: paymentFee },
  ].map((l) => ({ ...l, usd: cents(l.usd) }));

  const totalUsd = cents(lines.reduce((sum, l) => sum + l.usd, 0));
  const ngnPerUsd = cents(r.ngnPerUsd * (1 + r.fxBufferRate));
  return {
    itemPriceUsd: input.itemPriceUsd,
    weightLb: input.weightLb,
    quantity,
    lines,
    totalUsd,
    totalNgn: Math.round(totalUsd * ngnPerUsd),
    ngnPerUsd,
  };
}
