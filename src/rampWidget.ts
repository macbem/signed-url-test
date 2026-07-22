import * as crypto from "crypto";
import * as fs from "fs";

import { computeIpHash } from "./ipHash";

export interface WidgetParams {
  defaultFlow?: "ONRAMP" | "OFFRAMP" | "SWAP";
  enabledFlows?: string;
  hostApiKey?: string;
  userAddress?: string;
  swapAsset?: string;
  fiatCurrency?: string;
  ipHash?: string;
  [key: string]: string | undefined;
}

export interface IpHashOptions {
  secret: string;
  ip: string;
}

export interface GenerateSignedUrlOptions {
  baseUrl?: string;
  ipHash?: IpHashOptions;
}

export interface SignedUrlResult {
  url: string;
  signature: string;
  timestamp: number;
  queryString: string;
  ipHash?: string;
  ipHashPlaintext?: string;
}

export function generateSignedUrl(
  privateKeyPath: string,
  widgetParams: WidgetParams = {},
  options: GenerateSignedUrlOptions = {}
): SignedUrlResult {
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  const defaultParams: WidgetParams = {
    defaultFlow: "ONRAMP",
    enabledFlows: "ONRAMP",
    hostApiKey: "[API KEY HERE]",
    hostLogoUrl: "https://example.com/logo.png",
  };

  const allParams: WidgetParams = { ...defaultParams, ...widgetParams };

  let ipHash: string | undefined;
  let ipHashPlaintext: string | undefined;

  if (options.ipHash) {
    const hostApiKey = allParams.hostApiKey;
    if (!hostApiKey || hostApiKey === "[API KEY HERE]") {
      throw new Error(
        "hostApiKey is required to compute ipHash (pass --host-api-key)"
      );
    }
    const computed = computeIpHash(
      options.ipHash.secret,
      hostApiKey,
      options.ipHash.ip
    );
    ipHash = computed.ipHash;
    ipHashPlaintext = computed.plaintext;
    allParams.ipHash = ipHash;
  }

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

  const baseUrl = options.baseUrl ?? "https://app.rampnetwork.com";
  const finalUrl = `${baseUrl}?${queryWithTimestamp}&signature=${encodeURIComponent(
    base64Signature
  )}`;

  return {
    url: finalUrl,
    signature: base64Signature,
    timestamp,
    queryString: queryWithTimestamp,
    ipHash,
    ipHashPlaintext,
  };
}
