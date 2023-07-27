use fuels::accounts::fuel_crypto::SecretKey;
use fuels::prelude::*;
use fuels::tx::{AssetId, Output, Receipt};
use fuels::types::input::Input;
use fuels::types::transaction_builders::{ScriptTransactionBuilder, TransactionBuilder};

/// Sets up a test fuel environment with a funded wallet
pub async fn setup_environment(
    coins: Vec<(u64, AssetId, &Bech32Address)>,
) -> (Provider, WalletUnlocked) {
    // Create a wallet with some coins for gas
    let secret_key1: SecretKey =
        "0x862512a2363db2b3a375c0d4bbbd27172180d89f23f2e259bac850ab02619301"
            .parse()
            .unwrap();
    let mut wallet = WalletUnlocked::new_from_private_key(secret_key1, None);
    let mut all_coins = setup_single_asset_coins(wallet.address(), AssetId::default(), 32, 64);

    // Add the specified coins
    all_coins.append(
        &mut coins
            .iter()
            .flat_map(|coin| setup_single_asset_coins(coin.2, coin.1, 1, coin.0))
            .collect::<Vec<_>>(),
    );

    // Setup the environment
    let (provider, _) = setup_test_provider(all_coins, vec![], None, None).await;
    wallet.set_provider(provider.clone());

    (provider, wallet)
}

/// Gets the balance of the given address
pub async fn balance(provider: &Provider, address: &Bech32Address, asset_id: AssetId) -> u64 {
    provider.get_asset_balance(address, asset_id).await.unwrap()
}

/// Executes a typical simple refuel tx
pub async fn execute_refuel_tx(
    provider: &Provider,
    inputs: &[Input],
    outputs: &[Output],
    gas_limit: u64,
    gas_price: u64,
) -> Vec<Receipt> {
    let consensus_parameters = provider.chain_info().await.unwrap().consensus_parameters;
    let tx = ScriptTransactionBuilder::prepare_transfer(
        inputs.to_vec(),
        outputs.to_vec(),
        TxParameters::new(gas_price, gas_limit, 0),
    )
    .set_consensus_parameters(consensus_parameters)
    .build()
    .unwrap();

    //println!("tx: {:?}", tx);

    provider.send_transaction(&tx).await.unwrap()
}
