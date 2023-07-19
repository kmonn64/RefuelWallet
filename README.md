# Refuel Wallet

The Refuel Wallet is a set of middleware software that enables interaction with the Fuel chain using existing EVM based wallets. This consists of three different parts:
1. **JSON-RPC API** - A server that wraps Fuel chain data and interaction into the more common EVM JSON-RPC API
2. **Coin Predicate** - A predicate that requires a signed EVM transaction in order to unlock coins and spend them in the desired way
3. **Nonce Manager (not yet implemented)** - A Fuel smart contract that keeps track and helps authenticate nonces to prevent replay attacks

## Run Demo

### Dependencies

| dep     | version                                                           |
| ------- | ----------------------------------------------------------------- |
| Node.js | [latest](https://nodejs.org/en)                                   |

### Install and Run Server

Navigate to the `rpc` folder then install dependencies and start server:

```sh
npm ci
npm run start
```

### Connect MetaMask to the Fuel Chain via RefuelWallet

TODO

### Send Initial Funds to MetaMask Wallet

TODO: setup some npm script to convert an ethereum address to a fuel address

## License

The primary license for this repo is `Apache-2.0`, see [`LICENSE`](./LICENSE).
