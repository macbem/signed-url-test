export interface CliOptions {
  help: boolean;
  secret?: string;
  ip?: string;
  hostApiKey?: string;
  baseUrl?: string;
  userAddress?: string;
  flow?: "ONRAMP" | "OFFRAMP" | "SWAP";
  enabledFlows?: string;
}

function takeValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "--secret":
        options.secret = takeValue(argv, i, arg);
        i++;
        break;
      case "--ip":
        options.ip = takeValue(argv, i, arg);
        i++;
        break;
      case "--host-api-key":
        options.hostApiKey = takeValue(argv, i, arg);
        i++;
        break;
      case "--base-url":
        options.baseUrl = takeValue(argv, i, arg);
        i++;
        break;
      case "--user-address":
        options.userAddress = takeValue(argv, i, arg);
        i++;
        break;
      case "--flow": {
        const flow = takeValue(argv, i, arg).toUpperCase();
        if (flow !== "ONRAMP" && flow !== "OFFRAMP" && flow !== "SWAP") {
          throw new Error(`Invalid --flow ${flow}. Use ONRAMP|OFFRAMP|SWAP`);
        }
        options.flow = flow;
        i++;
        break;
      }
      case "--enabled-flows":
        options.enabledFlows = takeValue(argv, i, arg);
        i++;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

export function printHelp(): void {
  console.log(`Usage: npm start -- [options]

Options:
  --secret <string>           IP hash secret (required with --ip)
  --ip <address|auto|auto4|auto6>
                              Include ipHash bound to this IP.
                              auto/auto4 = public IPv4 via api.ipify.org
                              auto6 = public IPv6 via api64.ipify.org
  --host-api-key <key>        Host API key used in URL + ipHash plaintext
  --base-url <url>            Widget base URL (default: https://app.rampnetwork.com)
  --user-address <addr>       Optional crypto address
  --flow <ONRAMP|OFFRAMP|SWAP>
  --enabled-flows <list>      e.g. ONRAMP or ONRAMP,OFFRAMP
  -h, --help                  Show this help

Examples:
  npm start -- --host-api-key KEY --secret secret-a --ip auto
  npm start -- --host-api-key KEY --secret secret-a --ip 8.8.8.8
  npm start -- --host-api-key KEY --secret secret-a --ip 2001:db8::1 \\
    --base-url https://app.demo.ramp-network.org
`);
}

export async function resolveIp(ipOption: string): Promise<string> {
  const normalized = ipOption.trim().toLowerCase();
  if (normalized === "auto" || normalized === "auto4") {
    return fetchPublicIp("https://api.ipify.org");
  }
  if (normalized === "auto6") {
    return fetchPublicIp("https://api64.ipify.org");
  }
  return ipOption.trim();
}

async function fetchPublicIp(endpoint: string): Promise<string> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch public IP from ${endpoint}: ${response.status}`);
  }
  const ip = (await response.text()).trim();
  if (!ip) {
    throw new Error(`Empty IP response from ${endpoint}`);
  }
  return ip;
}
