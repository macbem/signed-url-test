import { generateSignedUrl } from "./rampWidget";
import { generateEd25519KeyPair } from "./generateKeys";
import * as fs from "fs";
import * as path from "path";

/**
 * Main example demonstrating Ramp widget URL generation with Ed25519 signature
 */
async function main(): Promise<void> {
  console.log("🚀 Ramp Widget Signature Example\n");

  const keysDir = path.join(__dirname, "..", "keys");
  const privateKeyPath = path.join(keysDir, "private_key.pem");
  const publicKeyPath = path.join(keysDir, "public_key.pem");

  // Step 1: Generate Ed25519 key pair if they don't exist
  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.log("📋 Step 1: Generating Ed25519 key pair...\n");
    generateEd25519KeyPair();
    console.log("\n");
  } else {
    console.log("📋 Step 1: Using existing Ed25519 key pair\n");
  }

  try {
    // Step 2: Generate signed URL with default parameters
    console.log("📋 Step 2: Generating signed widget URL...\n");
    const result = generateSignedUrl(privateKeyPath);

    console.log("✅ Default Widget URL Generated:");
    console.log("URL:", result.url);
    console.log("Timestamp:", result.timestamp);
    console.log("Signature:", result.signature);
    console.log("Query String:", result.queryString);
    console.log("\n");

    console.log("🎉 Example completed successfully!");
    console.log(
      "\n💡 You can now use the generated signed URLs to embed the Ramp widget."
    );
  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
