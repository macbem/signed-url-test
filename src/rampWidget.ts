import * as crypto from "crypto";
import * as fs from "fs";

export interface WidgetParams {
  defaultFlow?: "ONRAMP" | "OFFRAMP" | "SWAP";
  enabledFlows?: string;
  hostApiKey: string;
  userAddress?: string;
  swapAsset?: string;
  fiatCurrency?: string;
  [key: string]: string | undefined;
}

export interface SignedUrlResult {
  url: string;
  signature: string;
  timestamp: number;
  queryString: string;
}

/**
 * Generate signed Ramp widget URL
 */
export function generateSignedUrl(
  privateKeyPath: string,
  widgetParams: WidgetParams = {}
): SignedUrlResult {
  // Load private key
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  // Default widget parameters
  const defaultParams: WidgetParams = {
    defaultFlow: "ONRAMP",
    enabledFlows: "ONRAMP",
    hostApiKey: undefined, // replace this with your host api key
  };

  // Merge default params with provided params
  const allParams: WidgetParams = { ...defaultParams, ...widgetParams };

  // Build query string without URL encoding
  const queryPairs: string[] = [];
  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryPairs.push(`${key}=${value}`);
    }
  });

  const queryString = queryPairs.join('&');

  // Add timestamp and sign
  const timestamp = Math.floor(Date.now());
  const queryWithTimestamp = `${queryString}&timestamp=${timestamp}`;

  console.log("Query string to sign:", queryWithTimestamp);

  // Create signature using Ed25519
  const data = Buffer.from(queryWithTimestamp, "utf8");
  const signature = crypto.sign(null, data, privateKey);
  const base64Signature = signature.toString("base64");

  // Create final URL
  const baseUrl = ""; // put the widget URL here
  const finalUrl = `${baseUrl}?${queryWithTimestamp}&signature=${encodeURIComponent(
    base64Signature
  )}`;

  return {
    url: finalUrl,
    signature: base64Signature,
    timestamp,
    queryString: queryWithTimestamp,
  };
}
