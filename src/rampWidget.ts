import * as crypto from "crypto";
import * as fs from "fs";

export interface WidgetParams {
  defaultFlow?: "ONRAMP" | "OFFRAMP" | "SWAP";
  enabledFlows?: string;
  hostApiKey?: string;
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

export function generateSignedUrl(
  privateKeyPath: string,
  widgetParams: WidgetParams = {}
): SignedUrlResult {
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  const defaultParams: WidgetParams = {
    defaultFlow: "ONRAMP",
    enabledFlows: "ONRAMP",
    hostApiKey: "[API KEY HERE]",
    hostLogoUrl: 'https://example.com/logo.png'
  };

  const allParams: WidgetParams = { ...defaultParams, ...widgetParams };

  const urlSearchParams = new URLSearchParams();
  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlSearchParams.set(key, value);
    }
  });
  const queryString = urlSearchParams.toString();

  const timestamp = Math.floor(Date.now());
  const queryWithTimestamp = `${queryString}&timestamp=${timestamp}`;

  const data = Buffer.from(queryWithTimestamp, "utf8");
  const signature = crypto.sign(null, data, privateKey);
  const base64Signature = signature.toString("base64");

  const baseUrl = "https://app.rampnetwork.com";
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
