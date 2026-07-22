import { createHash } from "crypto";

/**
 * Ramp signed-URL IP binding:
 *   ipHash = lowercase hex SHA-256 of `${secret}-${hostApiKey}-${ip}`
 */
export function computeIpHash(
  secret: string,
  hostApiKey: string,
  ipAddress: string
): { ipHash: string; plaintext: string } {
  const plaintext = `${secret}-${hostApiKey}-${ipAddress.trim()}`;
  const ipHash = createHash("sha256").update(plaintext, "utf8").digest("hex");
  return { ipHash, plaintext };
}
