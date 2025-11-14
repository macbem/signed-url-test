import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface KeyPairResult {
  publicKey: string;
  privateKey: string;
  publicKeyPath: string;
  privateKeyPath: string;
}

/**
 * Generate Ed25519 key pair for signing Ramp widget URLs
 */
export function generateEd25519KeyPair(): KeyPairResult {
  console.log("Generating Ed25519 key pair...");

  // Generate Ed25519 key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  // Create keys directory if it doesn't exist
  const keysDir = path.join(__dirname, "..", "keys");
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
  }

  // Save private key
  const privateKeyPath = path.join(keysDir, "private_key.pem");
  fs.writeFileSync(privateKeyPath, privateKey);
  console.log(`Private key saved to: ${privateKeyPath}`);

  // Save public key
  const publicKeyPath = path.join(keysDir, "public_key.pem");
  fs.writeFileSync(publicKeyPath, publicKey);
  console.log(`Public key saved to: ${publicKeyPath}`);

  // Extract the raw base64 content from PEM format
  const publicKeyBase64 = publicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  console.log("\n--- IMPORTANT ---");
  console.log("Please share the PUBLIC KEY with Ramp Network:");
  console.log("File location:", publicKeyPath);
  console.log("\nPublic Key Content (PEM format):");
  console.log(publicKey);
  console.log("\nPublic Key Content (Ramp format):");
  console.log("====begin public key====");
  console.log(publicKeyBase64);
  console.log("====end public key====");

  return { publicKey, privateKey, publicKeyPath, privateKeyPath };
}

// Run key generation if this script is executed directly
if (require.main === module) {
  generateEd25519KeyPair();
}
