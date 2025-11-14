# Ramp Widget Signature Example

This project demonstrates how to generate Ed25519 signed URLs for the Ramp widget.

## Features

- Ed25519 key pair generation
- Signed URL creation for Ramp widget
- TypeScript implementation with full type safety

## Setup

Install dependencies:

```bash
npm install
```

## Usage

### Generate and Run (All-in-One)

To generate keys (if needed) and create a signed widget URL:

```bash
npm start
```

### Generate Keys Only

To only generate Ed25519 key pair:

```bash
npm run generate-keys
```

This will:
1. Generate a new Ed25519 key pair
2. Save the keys to the `keys/` directory
3. Display the public key in both PEM and Ramp formats

**Important:** Share the public key (in the `====begin public key====` format) with Ramp Network.

### Build Only

To compile TypeScript to JavaScript:

```bash
npm run build
```

## Project Structure

```
.
├── src/
│   ├── index.ts          # Main entry point
│   ├── generateKeys.ts   # Key pair generation
│   └── rampWidget.ts     # Signed URL generation
├── keys/                 # Generated key pairs (created automatically)
│   ├── private_key.pem
│   └── public_key.pem
├── dist/                 # Compiled JavaScript (created on build)
├── package.json
├── tsconfig.json
└── README.md
```

## Security Notes

- **Never commit your private key** to version control
- The `keys/` directory is excluded from git (add to .gitignore)
- Only share your **public key** with Ramp Network

## How It Works

1. **Key Generation**: Creates an Ed25519 key pair using Node.js crypto module
2. **URL Construction**: Builds query string with widget parameters and timestamp
3. **Signing**: Signs the query string using the private key
4. **URL Assembly**: Combines base URL, query parameters, and signature

## Example Output

The public key will be displayed in the format required by Ramp:

```
====begin public key====
MCowBQYDK2VwAyEA...base64content...
====end public key====
```
