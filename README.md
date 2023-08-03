<img alt="ReFuel Wallet logo" width="800px" src="./docs/img/banner.jpg">

Supercharging common EVM wallets with the power of **Fuel v2**

## Project Overview

The ReFuel wallet is a set of middleware that enables interaction with a Fuel v2 chain using existing EVM based wallets and consists of three different parts:
- **[JSON-RPC API](./rpc)** - [[DEMO]](./rpc/README.md#run-demo) A server that wraps interacting with Fuel v2 into the more common EVM JSON-RPC API 
- **[Coin Predicate](./predicate)** - [[DEMO]](./predicate/README.md#run-demo) A predicate that requires a signed EVM transaction in order to unlock coins and spend them in the desired way
- **[Nonce Manager](./nonce)** - A Fuel smart contract that helps keeps track of account nonces to prevent replay attacks

For a more detailed overview of the project, refer to the more in-depth overview found [here](./docs/ReFuelWalletOverview.pdf).

## TODOs

**JSON-RPC**
- [x] [https://github.com/kmonn64/RefuelWallet/issues/1] Create PoC with gas reporting and transaction submission
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/5] Update to the latest version of Fuel/Sway/SDKs
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/4] Integrate Nonce Manager contract
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/10] Migrate JSON-RPC server to more permanent solution
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/11] Integrate predicate with the JSON-RPC API
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/12] Implement actual gas price reporting
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/13] Better error handling for JSON-RPC
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/14] Improve data conversion/reporting
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/15] Investigate if returned Fuel data is correct
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/16] Better implement gas estimation
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/9] Add support for alternate signing as a fallback
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/6] Add support for ERC-20 tokens
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/8] Add support for generalized transaction construction
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/7] Add support for other EVM transaction types

**Predicate**
- [x] [https://github.com/kmonn64/RefuelWallet/issues/2] Create PoC predicate with RLP and signature decoding
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/5] Update to the latest version of Fuel/Sway/SDKs
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/19] Petition to get more output change exposure in the GTF opcode
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/4] Integrate Nonce Manager contract
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/17] Use proper loops in predicate
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/18] Update manual GTF functions
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/20] Update refuel address generation function
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/21] Get to the bottom of the GTF return issue
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/22] Actually verify gas limit in predicate
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/9] Add support for alternate signing as a fallback
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/6] Add support for ERC-20 tokens
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/7] Add support for other EVM transaction types
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/8] Add support for generalized transaction construction
- [ ] [https://github.com/kmonn64/RefuelWallet/issues/23] Create a list of allowed tx scripts

**Nonce Manager**
- [ ] Create nonce token minting contract

## License

The primary license for this repo is `Apache-2.0`, see [`LICENSE`](./LICENSE).
