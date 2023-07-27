use ethers::types::transaction::eip2718::TypedTransaction;
use ethers::utils::rlp::Rlp;
use fuels::accounts::predicate::Predicate;
use fuels::prelude::*;
use fuels::tx::{Address, AssetId, Contract as tx_contract, Output};
use fuels::types::input::Input;

abigen!(Predicate(
    name = "RefuelPredicate",
    abi = "./refuel-predicate/out/debug/refuel_predicate-abi.json"
));

const PREDICATE_BINARY: &str = "../refuel-predicate/out/debug/refuel_predicate.bin";

/// Gets the refuel wallet predicate from the given evm public address
pub fn compute_refuel_account(public_address: [u8; 20]) -> (Bech32Address, Vec<u8>) {
    let mut predicate_bytecode = std::fs::read(PREDICATE_BINARY).unwrap();

    // pad with zeros to the nearest 8 bytes (u64)
    let to_pad = predicate_bytecode.len() % 8;
    let zeros = vec![0u8; to_pad];
    predicate_bytecode.extend(zeros);

    // add the public address to the end of the predicate
    predicate_bytecode.extend(vec![0u8; 12]);
    predicate_bytecode.extend(public_address.to_vec());

    // calculate the predicate root
    let predicate_root = Address::from(*tx_contract::root_from_code(&predicate_bytecode));
    (predicate_root.into(), predicate_bytecode)
}

/// Builds a typical refuel transaction io for an evm transfer
pub async fn build_refuel_transfer_tx(
    provider: &Provider,
    signed_evm_tx: Vec<u8>,
) -> (Vec<Input>, Vec<Output>, u64, u64) {
    // Decode transaction data
    let (tx, _) = TypedTransaction::decode_signed(&Rlp::new(&signed_evm_tx.to_vec())).unwrap();
    let (from, from_predicate) = compute_refuel_account(tx.from().unwrap().to_fixed_bytes());
    let (to, _) = compute_refuel_account(tx.to().unwrap().as_address().unwrap().to_fixed_bytes());
    let gas_price = tx.gas_price().unwrap().as_u64();
    let gas_limit = tx.gas().unwrap().as_u64();
    let (value, asset_id) = match tx.data() {
        None => (tx.value().unwrap().as_u64(), AssetId::default()),
        Some(_) => {
            //TODO: add support for other token types
            (0, AssetId::default())
        }
    };
    println!("from: {:?}", tx.from().unwrap());
    println!("to: {:?}", tx.to().unwrap().as_address().unwrap());
    println!("gas_price: {:?}", gas_price);
    println!("gas_limit: {:?}", gas_limit);
    println!("value: {:?}", value);

    // Load refuel wallet predicate to search coins for
    let predicate_data = RefuelPredicateEncoder::encode_data(fuels::types::Bytes(signed_evm_tx));
    let predicate: Predicate = Predicate::from_code(from_predicate)
        .with_data(predicate_data)
        .with_provider(provider.clone());

    // Setup list of inputs and outputs
    let mut tx_inputs: Vec<Input> = Vec::new();
    let mut tx_outputs: Vec<Output> = Vec::new();

    // Fetch tokens to transfer
    if asset_id != AssetId::default() {
        tx_inputs.append(
            &mut predicate
                .get_asset_inputs_for_amount(asset_id, value, None)
                .await
                .unwrap(),
        );
    }

    // Fetch tokens for gas
    let gas_amount = if asset_id == AssetId::default() {
        (gas_limit * gas_price) + value
    } else {
        gas_limit * gas_price
    };
    tx_inputs.append(
        &mut predicate
            .get_asset_inputs_for_amount(asset_id, gas_amount, None)
            .await
            .unwrap(),
    );

    // Add token output
    tx_outputs.push(Output::coin(to.into(), value, asset_id));

    // Add token change for gas
    tx_outputs.push(Output::change(from.into(), 0, AssetId::default()));

    (tx_inputs, tx_outputs, gas_limit, gas_price)
}
