mod utils {
    pub mod builder;
    pub mod evm;
    pub mod fuel;
}
use utils::builder;

// Test that input messages can be relayed to a contract
// and that the contract can successfully parse the message data
mod success {
    use crate::utils::builder;
    use crate::utils::evm;
    use crate::utils::fuel;
    use fuels::test_helpers::DEFAULT_COIN_AMOUNT;
    use fuels::tx::AssetId;

    pub const RAND_KEY: &str = "1a896ebd5f55c10bc830755278e6d2b9278b4177b8bca400d3e7710eee293786";
    pub const RAND_KEY2: &str = "d5f55c10bc830755278e6d2b9eb0d3e7710278b937864177b8bca401a89612e2";

    #[tokio::test]
    async fn refuel_wallet_simple_transfer() {
        let asset_id = AssetId::default();
        let amount: u64 = 100_000_000;

        // Create EVM accounts and get corresponding refuel account addresses
        let evm_account = evm::create_account(RAND_KEY);
        let evm_account2 = evm::create_account(RAND_KEY2);
        let refuel_account = evm::refuel_addr(&evm_account);
        let refuel_account2 = evm::refuel_addr(&evm_account2);
        //println!("refuel_account: {:?}", Address::from(&refuel_account));
        //println!("refuel_account2: {:?}", Address::from(&refuel_account2));

        // Setup test environment
        let gas = (DEFAULT_COIN_AMOUNT, AssetId::default(), &refuel_account);
        let coins = (amount, asset_id, &refuel_account);
        let (provider, _) =
            fuel::setup_environment(vec![gas, coins, coins, coins, coins, coins]).await;

        // Build typical refuel transaction
        let signed_tx =
            evm::signed_transfer_tx(&evm_account, &evm_account2, amount * 3, asset_id).await;
        let (inputs, outputs, gas_limit, gas_price) =
            builder::build_refuel_transfer_tx(&provider, signed_tx).await;

        //println!("inputs: {:?}", inputs);
        //println!("outputs: {:?}", outputs);

        // Execute refuel tx
        let refuel_bal = fuel::balance(&provider, &refuel_account, asset_id).await;
        let refuel2_bal = fuel::balance(&provider, &refuel_account2, asset_id).await;
        let _receipts =
            fuel::execute_refuel_tx(&provider, &inputs, &outputs, gas_limit, gas_price).await;

        // Check ending balances
        assert_eq!(
            refuel_bal - (amount * 3) - 1,
            fuel::balance(&provider, &refuel_account, asset_id).await
        );
        assert_eq!(
            refuel2_bal + (amount * 3),
            fuel::balance(&provider, &refuel_account2, asset_id).await
        );
    }
}
