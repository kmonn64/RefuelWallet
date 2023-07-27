use crate::builder;

use ethers::{
    abi::AbiEncode,
    signers::{LocalWallet, Signer},
    types::{transaction::eip2718::TypedTransaction, Eip1559TransactionRequest, U256},
};
use fuels::{prelude::Bech32Address, types::AssetId};

const FUEL_CHAIN_ID: u64 = 621512; // (f u e l -> 6 21 5 12)
const GAS_TOKEN_TRANSFER: u64 = 1_000_000; // TODO: actually calculate what this is so it's not too high
const GAS_FEE: u64 = 1;

/// Creates an EVM account from a private key
pub fn create_account(private_key: &str) -> LocalWallet {
    private_key
        .parse::<LocalWallet>()
        .unwrap()
        .with_chain_id(FUEL_CHAIN_ID)
}

/// Computes the refuel address for an EVM account
pub fn refuel_addr(wallet: &LocalWallet) -> Bech32Address {
    let public_key = wallet.address().to_fixed_bytes();
    println!("public_addr: {}", public_key.encode_hex());
    let (addr, _) = builder::compute_refuel_account(public_key);
    addr
}

/// Creates a signed EVM transaction for a simple transfer
pub async fn signed_transfer_tx(
    from: &LocalWallet,
    to: &LocalWallet,
    amount: u64,
    asset_id: AssetId,
) -> Vec<u8> {
    let (value, data) = if asset_id == AssetId::default() {
        (amount, vec![])
    } else {
        //TODO: add support for other token types
        (0, vec![])
    };

    // Build transaction
    let tx: TypedTransaction = Eip1559TransactionRequest::new()
        .gas(GAS_TOKEN_TRANSFER)
        .value(value)
        .nonce(1)
        .data(data)
        .chain_id(FUEL_CHAIN_ID)
        .to(to.address())
        .max_fee_per_gas(GAS_FEE)
        .max_priority_fee_per_gas(0)
        .value(U256::from(amount))
        .into();
    println!("raw_tx: {:}", tx.rlp());

    let signature = from.sign_transaction(&tx).await.unwrap();
    let signed_tx = tx.rlp_signed(&signature);
    println!("raw_signed_tx: {:}", signed_tx);

    signed_tx.to_vec()
}
