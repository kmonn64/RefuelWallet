# Refuel Wallet Coin Predicate

The Refuel Wallet Coin Predicate is for coins that are custodied by EVM style signatures and unlocked through signed EVM transactions. This predicate runs through the following checks:
- Predicate data is a signed EVM transaction
- EVM transaction signature is as expected
- Checks what type of transaction this is...
	- Simple transfer or ERC20 token transfer
		- Nonce NFT is included as input
		- Nonce NFT contract is included
		- Appropriate amount of inputs are included
		- Appropriate outputs are included
    - Enough gas has been provided
    - Script bytecode hash for the transaction matches for the designated [Token Script](#token-script)

If all of these conditions are met, then the predicate evaluates as true.

### Token Script

The predicate relies on a script for simple token transfer transactions that performs only the following operations:
- Transfer the exact amount of tokens to the recipient specified in the signed EVM transaction

## Building From Source

### Dependencies

| dep     | version                                                  |
| ------- | -------------------------------------------------------- |
| Forc    | [beta-3](https://fuellabs.github.io/sway/v0.42.0/book/introduction/installation.html) |

### Building

Build:

```sh
forc build
```

Run tests:

```sh
cargo test
```

## Contributing

Code must be formatted.

```sh
forc fmt
cargo fmt
```

## License

The primary license for this repo is `Apache 2.0`, see [`LICENSE`](./LICENSE).
