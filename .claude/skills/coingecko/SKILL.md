# CoinGecko API Integration Skill

---
name: coingecko
version: 1.0.0
description: Comprehensive assistance for CoinGecko API integration and cryptocurrency market data development
triggers:
  - coingecko
  - crypto price
  - cryptocurrency api
  - market data
  - coin price
  - crypto tracker
source: https://github.com/2025Emma/vibe-coding-cn/tree/main/i18n/zh/skills/coingecko
---

## Overview

This skill provides comprehensive assistance for CoinGecko API integration, enabling access to cryptocurrency market data including prices, market cap, volume, and historical data for 15,000+ coins across 250+ blockchain networks.

## When to Use

- Building crypto price trackers
- Integrating CoinGecko API endpoints
- Accessing cryptocurrency market data
- Querying DEX/onchain data via GeckoTerminal
- Implementing real-time price feeds

## API Authentication

### Demo API (Free Tier)
```
Root URL: https://api.coingecko.com/api/v3/
Header: x-cg-demo-api-key: YOUR_API_KEY
```

### Pro API (Paid Tier)
```
Root URL: https://pro-api.coingecko.com/api/v3/
Header: x-cg-pro-api-key: YOUR_API_KEY
```

**Best Practice**: Always use headers instead of query parameters for security.

## Quick Reference

### Core Endpoints

| Endpoint | Purpose | Update Frequency |
|----------|---------|------------------|
| `/simple/price` | Get current price of coins | 60s |
| `/coins/markets` | List coins with market data | 60s |
| `/coins/{id}` | Get coin details by ID | 60s |
| `/coins/{id}/market_chart` | Historical price data | 5min |
| `/coins/{id}/ohlc` | OHLC candlestick data | 30min |
| `/search/trending` | Trending coins | 10min |
| `/global` | Global crypto stats | 10min |

### Simple Price Query

```python
import requests

url = "https://api.coingecko.com/api/v3/simple/price"
params = {
    "ids": "bitcoin,ethereum",
    "vs_currencies": "usd,krw",
    "include_24hr_change": "true",
    "include_market_cap": "true"
}
headers = {"x-cg-demo-api-key": "YOUR_API_KEY"}

response = requests.get(url, params=params, headers=headers)
data = response.json()
# {'bitcoin': {'usd': 42000, 'krw': 55000000, ...}, ...}
```

### Get Market Data for Multiple Coins

```python
url = "https://api.coingecko.com/api/v3/coins/markets"
params = {
    "vs_currency": "usd",
    "order": "market_cap_desc",
    "per_page": 100,
    "page": 1,
    "sparkline": "false"
}
headers = {"x-cg-demo-api-key": "YOUR_API_KEY"}

response = requests.get(url, params=params, headers=headers)
coins = response.json()
```

### Historical Chart Data

```python
url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
params = {
    "vs_currency": "usd",
    "days": "30"  # 1, 7, 14, 30, 90, 180, 365, max
}
headers = {"x-cg-demo-api-key": "YOUR_API_KEY"}

response = requests.get(url, params=params, headers=headers)
data = response.json()
# {'prices': [[timestamp, price], ...], 'market_caps': [...], 'total_volumes': [...]}
```

### Trending Coins

```python
url = "https://api.coingecko.com/api/v3/search/trending"
headers = {"x-cg-demo-api-key": "YOUR_API_KEY"}

response = requests.get(url, headers=headers)
trending = response.json()
# {'coins': [{'item': {'id': 'bitcoin', 'name': 'Bitcoin', ...}}, ...]}
```

## GeckoTerminal (On-Chain DEX Data)

### Trending Pools

```python
# All networks
url = "https://api.geckoterminal.com/api/v2/networks/trending_pools"

# Specific network (e.g., Ethereum)
url = "https://api.geckoterminal.com/api/v2/networks/eth/trending_pools"

response = requests.get(url)
pools = response.json()
```

### Token Price by Contract

```python
network = "eth"  # ethereum
contract = "0xdac17f958d2ee523a2206206994597c13d831ec7"  # USDT

url = f"https://api.geckoterminal.com/api/v2/networks/{network}/tokens/{contract}"
response = requests.get(url)
token_data = response.json()
```

## MCP Server Integration

For AI applications, CoinGecko offers Model Context Protocol (MCP) server:

```json
{
  "mcpServers": {
    "coingecko": {
      "url": "https://mcp.api.coingecko.com/sse"
    }
  }
}
```

## Rate Limits

| Plan | Rate Limit | Monthly Credits |
|------|------------|-----------------|
| Demo (Free) | 10-30 calls/min | 10,000 |
| Analyst | 500 calls/min | 500,000 |
| Pro | 1000 calls/min | 5,000,000 |

## Boundaries (Not For)

- Real-time trading execution (use exchange APIs)
- Wallet management or transactions
- Price predictions or financial advice

## References

- [CoinGecko API Docs](https://docs.coingecko.com/)
- [GeckoTerminal API](https://www.geckoterminal.com/dex-api)
- Local: `references/` directory for detailed documentation
