# Refuel Wallet JSON-RPC

The JSON-RPC API for translating typical EVM chain interactions into Fuel chain interactions. Details on the API specification can be found [here](https://ethereum.org/en/developers/docs/apis/json-rpc/)

## Run Server

### Dependencies

| dep     | version                                                           |
| ------- | ----------------------------------------------------------------- |
| Node.js | [latest](https://nodejs.org/en)                                   |

### Install and Run

Install dependencies:

```sh
npm ci
```

Start server:

```sh
npm run start
```

### Quick Testing

There is a demo test file located at `test/test.js` to enable easy pinging of the JSON-RPC API.

Run the test:

```sh
npm run test
```

## License

The primary license for this repo is `Apache-2.0`, see [`LICENSE`](./LICENSE).
