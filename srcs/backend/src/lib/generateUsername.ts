import crypto from "crypto";

export function generateUsername(userId: string) {
  const hash = crypto
    .createHash("sha256")
    .update(userId)
    .digest("hex");

  return `user_${hash.slice(0, 10)}`;
}