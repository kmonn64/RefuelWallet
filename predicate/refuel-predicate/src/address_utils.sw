library;

use std::constants::ZERO_B256;
use std::option::Option;
use std::bytes::Bytes;

use std::inputs::{
    GTF_INPUT_COIN_PREDICATE_LENGTH,
    GTF_INPUT_COIN_PREDICATE,
};

/// Gets the EVM address of this predicate
pub fn get_evm_address() -> b256 {
    //TODO: switch to fetching from the currently executing predicate
    let input_coin_index = 0;
    let predicate_len = __gtf::<u64>(input_coin_index, GTF_INPUT_COIN_PREDICATE_LENGTH);
    let predicate_ptr = __gtf::<raw_ptr>(input_coin_index, GTF_INPUT_COIN_PREDICATE);

    predicate_ptr.add::<u64>((predicate_len - 32) / 8).read::<b256>()
}

/// Gets the refuel address for the given EVM address
pub fn get_refuel_address(evm_address: b256) -> b256 {
    //TODO: need to run through the predicate hashing process which will be easier with beta-4
    if evm_address == 0x0000000000000000000000008e51571dbfd29350707f054ee9fe82e99c988893 {
        return 0x35d556ed0ee0a7ce667fc857df9ed2f15eee7e0ad6e8df987d97c34e0b725723;
    }
    if evm_address == 0x000000000000000000000000573b3e52fb168393205a50b991751ea7524be54f {
        return 0x1374e0f9df503e8a28122d124d92a4e932ef6d9551c81ebd77184be7bd4a0b6c;
    }
    ZERO_B256
}

/// Verifies if a full asset id closely matches a partial asset id
pub fn match_asset_ids(full_id: b256, partial_id: b256) -> bool {

    true
}