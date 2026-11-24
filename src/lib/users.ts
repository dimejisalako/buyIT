import { randomBytes } from "crypto";
import { redis } from "./redis";
import { hashPassword } from "./password";

export type Role = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  passwordHash: string;
  sv: number; // session version: bumping it signs the user out everywhere
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash" | "sv">;

const USERS = "shopbrow:users";
const EMAILS = "shopbrow:user-emails";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const publicUser = (u: User): PublicUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  createdAt: u.createdAt,
});

export async function getUserById(id: string): Promise<User | null> {
  return (await redis().hget<User>(USERS, id)) ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const id = await redis().hget<string>(EMAILS, normalizeEmail(email));
  return id ? getUserById(id) : null;
}

export async function listUsers(): Promise<User[]> {
  const all = await redis().hgetall<Record<string, User>>(USERS);
  return Object.values(all ?? {}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Returns null if the email is already registered.
export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
}): Promise<User | null> {
  const id = "usr_" + randomBytes(9).toString("hex");
  const email = normalizeEmail(input.email);
  // hsetnx makes the email unique even under concurrent signups.
  const reserved = await redis().hsetnx(EMAILS, email, id);
  if (!reserved) return null;

  const user: User = {
    id,
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() || undefined,
    role: input.role ?? "customer",
    passwordHash: await hashPassword(input.password),
    sv: 1,
    createdAt: new Date().toISOString(),
  };
  await redis().hset(USERS, { [id]: user });
  return user;
}

export async function setPassword(id: string, password: string, role?: Role): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;
  const updated: User = {
    ...user,
    role: role ?? user.role,
    passwordHash: await hashPassword(password),
    sv: user.sv + 1,
  };
  await redis().hset(USERS, { [id]: updated });
  return updated;
}
