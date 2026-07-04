import argon2 from "argon2";

export function hashPassword(plain: string) {
  return argon2.hash(plain);
}

export function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain);
}
