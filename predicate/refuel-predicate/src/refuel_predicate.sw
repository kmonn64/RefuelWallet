predicate;

mod rlp_utils;
mod address_utils;
mod transaction_utils;

use std::constants::ZERO_B256;
use std::bytes::Bytes;
use rlp_utils::{decode_signed_tx};
use address_utils::{get_evm_address, get_refuel_address};
use transaction_utils::{
    input_coin_amount,
    input_coin_asset_id,
    input_count,
    output_count,
    output_coin_asset_id,
    output_coin_amount,
    output_coin_to,
    tx_gas_limit,
    tx_gas_price,
    verify_input_coin,
    verify_output_change,
    verify_output_coin,
};

///////////////
// PREDICATE //
///////////////
/// Predicate verifying a transaction was contructed according to a signed evm transaction
fn main(signed_tx: Bytes) -> bool {
    // Decode the transaction
    let (chain_id, nonce, maxFeePerGas, gasLimit, value, to, from, asset_id) = decode_signed_tx(signed_tx);

    // Get additional data
    let owner = get_evm_address();
    let to_refuel = get_refuel_address(to);
    assert(from == owner);

    // Value verification for debugging
    //if !(chain_id == 621512 && nonce == 1 && maxFeePerGas == 1 && gasLimit == 42000 && value == 300000000
    //    && to == 0x0000000000000000000000008e51571dbfd29350707f054ee9fe82e99c988893
    //    && from == 0x000000000000000000000000573b3e52fb168393205a50b991751ea7524be54f)
    //{
    //    return false;
    //}
    
    // Verify the transaction inputs
    let mut gas_total = 0;
    let mut token_total = 0;
    //TODO: turn into a loop that verifies more than just 6 inputs
    let in_count = input_count();
    assert(in_count <= 6);
    let i = 0;
    if i < in_count {
        assert(verify_input_coin(i));
        let coin_asset_id = input_coin_asset_id(i);
        if coin_asset_id == asset_id {
            token_total = token_total + input_coin_amount(i);
        } else if coin_asset_id == ZERO_B256 {
            gas_total = gas_total + input_coin_amount(i);
        }
    }
    let i = 1;
    if i < in_count {
        assert(verify_input_coin(i));
        let coin_asset_id = input_coin_asset_id(i);
        if coin_asset_id == asset_id {
            token_total = token_total + input_coin_amount(i);
        } else if coin_asset_id == ZERO_B256 {
            gas_total = gas_total + input_coin_amount(i);
        }
    }
    let i = 2;
    if i < in_count {
        assert(verify_input_coin(i));
        let coin_asset_id = input_coin_asset_id(i);
        if coin_asset_id == asset_id {
            token_total = token_total + input_coin_amount(i);
        } else if coin_asset_id == ZERO_B256 {
            gas_total = gas_total + input_coin_amount(i);
        }
    }
    let i = 3;
    if i < in_count {
        assert(verify_input_coin(i));
        let coin_asset_id = input_coin_asset_id(i);
        if coin_asset_id == asset_id {
            token_total = token_total + input_coin_amount(i);
        } else if coin_asset_id == ZERO_B256 {
            gas_total = gas_total + input_coin_amount(i);
        }
    }
    let i = 4;
    if i < in_count {
        assert(verify_input_coin(i));
        let coin_asset_id = input_coin_asset_id(i);
        if coin_asset_id == asset_id {
            token_total = token_total + input_coin_amount(i);
        } else if coin_asset_id == ZERO_B256 {
            gas_total = gas_total + input_coin_amount(i);
        }
    }
    let i = 5;
    if i < in_count {
        assert(verify_input_coin(i));
        let coin_asset_id = input_coin_asset_id(i);
        if coin_asset_id == asset_id {
            token_total = token_total + input_coin_amount(i);
        } else if coin_asset_id == ZERO_B256 {
            gas_total = gas_total + input_coin_amount(i);
        }
    }

    // Verify enough input coins for value transfer
    assert(token_total >= value);
    if asset_id == ZERO_B256 {
        gas_total = gas_total + (token_total - value);
    }

    // Verify the transaction outputs
    let mut output_coin_found = false;
    //TODO: turn into a loop that allows for any order
    let out_count = output_count();
    assert(out_count <= 2);
    let i = 0;
    if i < out_count {
        if verify_output_coin(i) {
            assert(!output_coin_found);
            assert(output_coin_asset_id(i) == asset_id);
            assert(output_coin_amount(i) == value);
            //TODO: investigate why this isn't working
            //assert(output_coin_to(i) == to_refuel);
            output_coin_found = true;
        } else if verify_output_change(i) {
            //TODO: need to verify output change is always back to the refuel predicate
        } else {
            assert(false);
        }
    }
    let i = 1;
    if i < out_count {
        if verify_output_coin(i) {
            assert(!output_coin_found);
            assert(output_coin_asset_id(i) == asset_id);
            assert(output_coin_amount(i) == value);
            //TODO: investigate why this isn't working
            //assert(output_coin_to(i) == to_refuel);
            output_coin_found = true;
        } else if verify_output_change(i) {
            //TODO: need to verify output change is always back to the refuel predicate
        } else {
            assert(false);
        }
    }


    // Verify enough tokens for gas
    //TODO: figure out weird behavior with tx_gas_price()
    //assert(tx_gas_price() >= maxFeePerGas);
    //assert(tx_gas_limit() >= gasLimit);
    //assert(gas_total >= (gasLimit * maxFeePerGas));

    //TODO: verify nonce

    // All checks have passed
    true
}
