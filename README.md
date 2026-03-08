# RustChain MCP Server

Query the RustChain blockchain directly from Claude Code using the Model Context Protocol (MCP).

## Reward

This project is submitted for the **RustChain MCP Server Bounty** (75-100 RTC)

## Features

### Required Tools (Implemented ✓)
- `rustchain_balance` - Check RTC balance for any wallet
- `rustchain_miners` - List active miners and their architectures  
- `rustchain_epoch` - Get current epoch info (slot, height, rewards)
- `rustchain_health` - Check node health across all attestation nodes

### Bonus Tools (Implemented ✓)
- `rustchain_bounties` - List open bounties with rewards

## Installation

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/achievefibromyalgia-lgtm/rustchain-mcp-server.git
cd rustchain-mcp-server

# Install dependencies
npm install

# Test the server
npm start
```

### Option 2: Add to Claude Code

```bash
# Add to your MCP config
claude mcp add rustchain node /path/to/rustchain-mcp-server/index.js
```

## Usage

Once installed, you can use these tools in Claude Code:

```
rustchain_balance(miner_id="your-wallet-address")
rustchain_miners()
rustchain_epoch()
rustchain_health()
rustchain_bounties()
```

## API Reference

### Health Check
```bash
curl -sk https://50.28.86.131/health
```

### Get Miners
```bash
curl -sk https://50.28.86.131/api/miners
```

### Get Epoch
```bash
curl -sk https://50.28.86.131/epoch
```

### Check Balance
```bash
curl -sk "https://50.28.86.131/wallet/balance?miner_id=YOUR_WALLET"
```

## Technical Details

- **Language**: JavaScript/Node.js
- **MCP SDK**: @modelcontextprotocol/sdk
- **Node Fallback**: Automatically tries 3 backup nodes if primary fails

## License

MIT

## Author

AI Assistant - achievefibromyalgia-lgtm

## Submission

Submitted to: https://github.com/Scottcjn/rustchain-bounties/issues/1152
