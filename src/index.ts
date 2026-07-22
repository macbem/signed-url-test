import * as fs from "fs";
import * as path from "path";

import { parseArgs, printHelp, resolveIp } from "./cli";
import { generateEd25519KeyPair } from "./generateKeys";
import { generateSignedUrl, type WidgetParams } from "./rampWidget";

async function main(): Promise<void> {
  console.log("🚀 Ramp Widget Signature Example\n");

  let cli;
  try {
    cli = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`❌ ${(error as Error).message}\n`);
    printHelp();
    process.exit(1);
  }

  if (cli.help) {
    printHelp();
    return;
  }

  if ((cli.secret && !cli.ip) || (!cli.secret && cli.ip)) {
    console.error("❌ --secret and --ip must be used together\n");
    printHelp();
    process.exit(1);
  }

  const keysDir = path.join(__dirname, "..", "keys");
  const privateKeyPath = path.join(keysDir, "private_key.pem");
  const publicKeyPath = path.join(keysDir, "public_key.pem");

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.log("📋 Step 1: Generating Ed25519 key pair...\n");
    generateEd25519KeyPair();
    console.log("\n");
  } else {
    console.log("📋 Step 1: Using existing Ed25519 key pair\n");
  }

  try {
    console.log("📋 Step 2: Generating signed widget URL...\n");

    const widgetParams: WidgetParams = {};
    if (cli.hostApiKey) widgetParams.hostApiKey = cli.hostApiKey;
    if (cli.userAddress) widgetParams.userAddress = cli.userAddress;
    if (cli.flow) {
      widgetParams.defaultFlow = cli.flow;
      widgetParams.enabledFlows = cli.enabledFlows ?? cli.flow;
    } else if (cli.enabledFlows) {
      widgetParams.enabledFlows = cli.enabledFlows;
    }

    let ipHashOptions: { secret: string; ip: string } | undefined;
    if (cli.secret && cli.ip) {
      const resolvedIp = await resolveIp(cli.ip);
      console.log(`🌐 Using IP for ipHash: ${resolvedIp}`);
      ipHashOptions = { secret: cli.secret, ip: resolvedIp };
    }

    const result = generateSignedUrl(privateKeyPath, widgetParams, {
      baseUrl: cli.baseUrl,
      ipHash: ipHashOptions,
    });

    console.log("✅ Widget URL Generated:");
    console.log("URL:", result.url);
    console.log("Timestamp:", result.timestamp);
    console.log("Signature:", result.signature);
    console.log("Query String:", result.queryString);
    if (result.ipHash) {
      console.log("ipHash:", result.ipHash);
      console.log("ipHash plaintext:", result.ipHashPlaintext);
    }
    console.log("\n🎉 Done — open the URL in a browser to exercise signature (+ optional ipHash) validation.");
  } catch (error) {
    console.error("❌ Error:", (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
}
