<picture>
  <img src="https://raw.githubusercontent.com/kmonn64/RefuelWallet/main/docs/img/logo.jpg" width="200px"/>
</picture>

# ReFuel JSON-RPC Server
A server that wraps interacting with Fuel v2 into the more common EVM JSON-RPC API. For a more detailed overview of the project, refer to the more in-depth overview found [here](./docs/ReFuelWalletOverview.pdf).

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

### Connect MetaMask to the Fuel Chain via ReFuel Wallet

Under the network selection dropdown, clock the "Add Network" button. Select the "Add a network manually" option down at the bottom of the screen. Fill in network details for the locally running ReFuel wallet server.

<picture>
  <img src="https://raw.githubusercontent.com/kmonn64/RefuelWallet/main/docs/demo_add_account.png" width="600px"/>
</picture>

### Fund MetaMask Accounts

Look up your accounts corresponding Fuel side addresses for the ReFuel predicate in the server console output. You should see ouput like this:
```
[info] 0xab5801a7d398351b8be11c439e05c5b3259aec9b -> 0xde6ffce0a2acf5d7f5cf8e19805e701ac98f11049fba48d398305935892042a5 -> fuel1mehlec9z4n6a0aw03cvcqhnsrtyc7ygyn7ay35ucxpvntzfqg2js9z2skw
```

Use the [Fuel Beta-3 Faucet](https://faucet-beta-3.fuel.network/) to fund your accounts using the corresponding Fuel addresses. Once funded, you should see the balance correctly reflected in your MetaMask wallet.

<picture>
  <img src="https://raw.githubusercontent.com/kmonn64/RefuelWallet/main/docs/demo_show_balance.png" width="300px"/>
</picture>

### Transfer Funds via MetaMask

Click the "Send" button in your MetaMask wallet and choose an account to send ETH to. You should be abe to go through the typical MetaMask process and see the gas fee set at 0.0001 ETH. Once you confirm the action, you should see your transactions go through sucessfully and the receiving account receive the sent ETH.

<picture>
  <img src="https://raw.githubusercontent.com/kmonn64/RefuelWallet/main/docs/demo_show_send.png" width="300px"/>
</picture>

<picture>
  <img src="https://raw.githubusercontent.com/kmonn64/RefuelWallet/main/docs/demo_show_sent.png" width="300px"/>
</picture>

## License

The primary license for this repo is `Apache-2.0`, see [`LICENSE`](./LICENSE).
