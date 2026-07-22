# Ramp Widget Signature Example

Generate Ed25519 signed Ramp widget URLs, optionally with the `ipHash` IP-binding param.

## Features

- Ed25519 key pair generation
- Signed URL creation for Ramp widget
- Optional `ipHash` = `SHA-256(${secret}-${hostApiKey}-${ip})` (lowercase hex)
- CLI flags for secret, IP (including auto-detect), host API key, and base URL

## Setup

```bash
npm install
```

## Usage

### Generate keys (once)

```bash
npm run generate-keys
```

Share the **public** key with Ramp (Support → API Key Security public keys). Keep the private key local.

### Signed URL (no ipHash)

```bash
npm start -- --host-api-key YOUR_HOST_API_KEY
```

### Signed URL with ipHash (soft-rollout / enforce testing)

```bash
# Hash your current public IPv4
npm start -- \
  --host-api-key YOUR_HOST_API_KEY \
  --secret secret-a \
  --ip auto \
  --base-url https://app.demo.ramp-network.org

# Force a mismatch (hash 8.8.8.8, browse from your real IP)
npm start -- \
  --host-api-key YOUR_HOST_API_KEY \
  --secret secret-a \
  --ip 8.8.8.8 \
  --base-url https://app.demo.ramp-network.org

# IPv6 literal in the hash (use with API header simulation or dual-stack)
npm start -- \
  --host-api-key YOUR_HOST_API_KEY \
  --secret secret-a \
  --ip 2001:db8::1
```

### CLI options

```
--secret <string>           IP hash secret (required with --ip)
--ip <address|auto|auto4|auto6>
                            Include ipHash. auto/auto4 = public IPv4, auto6 = public IPv6
--host-api-key <key>        Host API key (URL + ipHash plaintext)
--base-url <url>            Widget origin (default: https://app.rampnetwork.com)
--user-address <addr>
--flow <ONRAMP|OFFRAMP|SWAP>
--enabled-flows <list>
-h, --help
```

`--secret` and `--ip` must be passed together. When set, `ipHash` is added to the query string **before** signing.

## Project structure

```
src/
├── index.ts          # CLI entry
├── cli.ts            # Arg parsing + public IP lookup
├── ipHash.ts         # SHA-256 binding helper
├── generateKeys.ts
└── rampWidget.ts     # Signed URL generation
```

## Security notes

- Never commit `keys/`
- Only share the public key with Ramp
- `ipHash` plaintext recipe is logged locally for debugging — do not paste secrets into tickets

## How ipHash works

1. Partner builds plaintext: `` `${secret}-${hostApiKey}-${ip}` ``
2. `ipHash = sha256(plaintext)` as lowercase hex
3. Param is included in the signed query string
4. Ramp re-hashes the request IP against all configured secrets × host API keys
