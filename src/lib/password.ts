import { randomBytes, scrypt, timingSafeEqual } from "crypto";

const KEYLEN = 64;

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEYLEN, (err, key) => (err ? reject(err) : resolve(key)))
  );

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return "scrypt$" + salt.toString("hex") + "$" + key.toString("hex");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await derive(password, Buffer.from(saltHex, "hex"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Used to spend the same time on unknown emails as on real ones.
export const DUMMY_HASH = "scrypt$" + "00".repeat(16) + "$" + "00".repeat(KEYLEN);

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;
