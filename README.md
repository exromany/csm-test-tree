# CSM Test Tree

A Node.js/TypeScript utility for generating and managing Merkle trees for Lido's Community Staking Module (CSM). This tool handles two types of data: addresses for ICS (Initial Custody Service) and node operator strikes tracking.

## Overview

The CSM Test Tree tool creates Merkle trees from JSON data, uploads them to IPFS via Pinata, and updates smart contracts with the new tree parameters. It supports two workflows:

- **ICS**: Manages Ethereum addresses for vetted gate access
- **Strikes**: Tracks node operator performance violations

## Prerequisites

- Node.js and npm installed
- Foundry with `cast` command available
- Pinata account for IPFS uploads
- Access to deployed contracts (VettedGate and CSStrikes)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with required variables:
   ```
   PINATA_API_KEY=your_pinata_api_key
   PINATA_API_SECRET=your_pinata_secret
   DEPLOY_JSON_PATH=path/to/your/deploy.json
   ```

3. Ensure your deployment JSON contains contract addresses:
   ```json
   {
     "VettedGate": "0x...",
     "CSStrikes": "0x..."
   }
   ```

## Data Files

### addresses.json
Contains an array of Ethereum addresses for ICS whitelist:
```json
[
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
]
```

### strikes.json
Contains node operator strike data:
```json
[
  {
    "nodeOperatorId": 4,
    "pubkey": "0x8a1c6881aa97ac4e31694e42f837cd510355fed4760ac2495bb4d4b0df4ce2ce78bb27ee145e284563cb8582f7ee14e7",
    "strikes": [0, 0, 0, 0, 0, 1]
  }
]
```

## Usage

### Main Commands

Run the complete ICS workflow (generate tree + update contract):
```bash
npm run ics
```

Run the complete strikes workflow (generate tree + update contract):
```bash
npm run strikes
```

### Individual Steps

Generate ICS Merkle tree only:
```bash
npm run make-ics
```

Update VettedGate contract only:
```bash
npm run set-ics
```

Generate strikes Merkle tree only:
```bash
npm run make-strikes
```

Update CSStrikes contract only:
```bash
npm run set-strikes
```

## How It Works

1. **Tree Generation**: Creates OpenZeppelin StandardMerkleTree from JSON data
2. **IPFS Upload**: Uploads tree structure to Pinata IPFS
3. **Config Storage**: Saves tree root and IPFS CID to `tmp/config-*.json`
4. **Contract Update**: Uses Foundry's `cast` to update smart contracts with new parameters

## Output

After running the commands, you'll see:
- Tree root hash
- IPFS CID
- Updated configuration files in `tmp/` directory
- Contract transaction results

## Troubleshooting

- Ensure all environment variables are set correctly
- Verify contract addresses in your deployment JSON
- Check that Anvil is running if testing locally
- Confirm Pinata credentials have sufficient quota
- Make sure `cast` command is available in your PATH

## License

MIT
