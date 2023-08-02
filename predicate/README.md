<picture>
  <img src="https://raw.githubusercontent.com/kmonn64/RefuelWallet/main/docs/img/logo.jpg" width="200px"/>
</picture>

# ReFuel Predicate
A server that wraps interacting with Fuel v2 into the more common EVM JSON-RPC API. For a more detailed overview of the project, refer to the more in-depth overview found [here](./docs/ReFuelWalletOverview.pdf).

## Run Demo

### Dependencies

| dep     | version                                                  |
| ------- | -------------------------------------------------------- |
| Forc    | [beta-3](https://fuellabs.github.io/sway/v0.42.0/book/introduction/installation.html) |

### Building

Compile the predicate code using the following command.

```sh
forc build
```

### Execute ReFuel Predicate Transaction

Execute a transaction using the ReFuel predicate by running the tests.

```sh
cargo test
```

You should see a successful parsing of a signed EVM raw transaction by the predicate. You can see a detailed breakdown of all the data the predicate is parsing and checking in the predicates core code found [here](./refuel-predicate/src/refuel_predicate.sw).

## License

The primary license for this repo is `Apache-2.0`, see [`LICENSE`](./LICENSE).
