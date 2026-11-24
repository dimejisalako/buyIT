import { test } from "node:test";
import assert from "node:assert/strict";
import { DUMMY_HASH, hashPassword, verifyPassword } from "../src/lib/password.ts";
import { ACTION_LABEL, STATUSES, TIMELINE, nextStatus, transitionError } from "../src/lib/status.ts";

test("a password verifies against its own hash and not against another", async () => {
  const hash = await hashPassword("correct horse battery");
  assert.ok(hash.startsWith("scrypt$"));
  assert.equal(await verifyPassword("correct horse battery", hash), true);
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("hashing is salted, so the same password gives different hashes", async () => {
  assert.notEqual(await hashPassword("same-password"), await hashPassword("same-password"));
});

test("malformed or dummy hashes never verify", async () => {
  assert.equal(await verifyPassword("anything", "not-a-hash"), false);
  assert.equal(await verifyPassword("anything", DUMMY_HASH), false);
});

test("the happy path runs new → delivered in order and every status has an action label", () => {
  assert.equal(TIMELINE[0], "new");
  assert.equal(TIMELINE[TIMELINE.length - 1], "delivered");
  assert.equal(nextStatus("paid"), "purchased");
  assert.equal(nextStatus("delivered"), null);
  for (const s of STATUSES) assert.ok(ACTION_LABEL[s]);
});

test("orders can't skip payment or be marked paid by hand", () => {
  const unpaid = { status: "new" as const };
  assert.ok(transitionError(unpaid, "purchased"));
  assert.ok(transitionError(unpaid, "shipped"));
  assert.ok(transitionError(unpaid, "paid"));
  assert.equal(transitionError(unpaid, "quoted"), null);
  assert.equal(transitionError({ status: "quoted" }, "paid"), null);
  assert.equal(transitionError({ status: "paid", paidAt: "2026-01-01" }, "purchased"), null);
});

test("paid orders can move between fulfilment steps and be rejected, but not back to review", () => {
  const paid = { status: "shipped" as const, paidAt: "2026-01-01" };
  assert.equal(transitionError(paid, "arrived"), null);
  assert.equal(transitionError(paid, "received"), null);
  assert.equal(transitionError(paid, "rejected"), null);
  assert.ok(transitionError(paid, "new"));
});
