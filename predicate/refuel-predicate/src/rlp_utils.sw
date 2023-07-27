library;

use std::{bytes::Bytes, constants::ZERO_B256, math::*, option::Option, u256::U256};
use std::{
    b512::B512,
    vm::evm::{
        ecr::ec_recover_evm_address,
        evm_address::EvmAddress,
    },
};

// RLP encoding constants
//0x00-0x7f: it's own byte (transaction type identifier)
//0x80-0xb7: string identifier and how many bytes long it is [0-55]
//0xb7-0xbf: string identifier and how many next bytes represent it's length
//0xc0-0xf7: payload identifier and how many bytes long it is [0-55]
//0xf7-0xff: payload identifier and how many next bytes represent it's length
const RLP_SINGLE_BYTE_MAX = 0x7fu8;
const RLP_ITEM_IDENTIFIER_IMMEDIATE_START = 0x80u8;
const RLP_ITEM_IDENTIFIER_IMMEDIATE_MAX = 0xb7u8;
const RLP_ITEM_IDENTIFIER_BYTES_START = 0xb7u8;
const RLP_ITEM_IDENTIFIER_BYTES_MAX = 0xbfu8;
const RLP_PAYLOAD_IDENTIFIER_IMMEDIATE_START = 0xc0u8;
const RLP_PAYLOAD_IDENTIFIER_IMMEDIATE_MAX = 0xf7u8;
const RLP_PAYLOAD_IDENTIFIER_BYTES_START = 0xf7u8;
const RLP_PAYLOAD_IDENTIFIER_BYTES_MAX = 0xffu8;

/// Decodes a signed transaction
pub fn decode_signed_tx(signed_tx: Bytes) -> (u64, u64, u64, u64, u64, b256, b256, b256) {
    let type_identifier = signed_tx.get(0).unwrap();
    if type_identifier > RLP_SINGLE_BYTE_MAX {
        // TODO: add support for untyped legacy transactions
        revert(0);
    } else if type_identifier == 1u8 {
        // TODO: add support for access list transactions (type 1)
        revert(0);
    } else if type_identifier == 2u8 {
        // Type 2 EIP-1559 style transaction
        return tx_type2_decode(signed_tx);
    }

    // Unsupported transaction type
    revert(0);
    (0, 0, 0, 0, 0, ZERO_B256, ZERO_B256, ZERO_B256)
}

/// Type 2 Transaction ////////////////////////////////////////////////////////////////////////////////////
///
/// Decodes an EIP-1559 style transaction
fn tx_type2_decode(signed_tx: Bytes) -> (u64, u64, u64, u64, u64, b256, b256, b256) {
    let ptr: u64 = 1;

    //decode the payload opening
    let (ptr, _) = rlp_decode_payload(signed_tx, ptr);
    let ptr_tx_data_start = ptr;

    //first item is the chain id
    let (ptr, len) = rlp_decode_item(signed_tx, ptr);
    let chain_id = rlp_read_u64(signed_tx, ptr, len);

    //second item is the nonce
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let nonce = rlp_read_u64(signed_tx, ptr, len);

    //third item is the maxPriorityFeePerGas (ignore)
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);

    //fourth item is the maxFeePerGas
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let maxFeePerGas = rlp_read_u64(signed_tx, ptr, len);

    //fifth item is the gasLimit
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let gasLimit = rlp_read_u64(signed_tx, ptr, len);

    //sixth item is the to field
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let to = rlp_read_b256(signed_tx, ptr, len);

    //seventh item is the value
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let value = rlp_read_u64(signed_tx, ptr, len);

    //eigth item is the data
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    //TODO: analyze this data to determine what tokens are being transferred
    let asset_id = ZERO_B256;

    //ninth item is the accessList
    let (ptr, len) = rlp_decode_payload(signed_tx, ptr + len);
    let ptr_tx_data_end = ptr + len;

    //remaining three items are v, r, s
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let v = rlp_read_u64(signed_tx, ptr, len);
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let r = rlp_read_b256(signed_tx, ptr, len);
    let (ptr, len) = rlp_decode_item(signed_tx, ptr + len);
    let s = rlp_read_b256(signed_tx, ptr, len);

    //compute the digest that the sender signs
    let digest = tx_type2_digest(signed_tx, ptr_tx_data_start, ptr_tx_data_end);

    //use signature to get the "from" public key
    //TODO: "v" is not currently being used
    let sig = compact_signature(r, s, v);
    let from: b256 = ec_recover_evm_address(sig, digest).unwrap().into();

    //return decoded data
    (chain_id, nonce, maxFeePerGas, gasLimit, value, to, from, asset_id)
}

/// Returns the digest of a signed tx (the thing the signer signed)
fn tx_type2_digest(data: Bytes, ptr_start: u64, ptr_end: u64) -> b256 {
    let txtype = 2;
    let mut value: (u64, u64, u64, u64) = (0, 0, 0, 0);
    let dst = __addr_of(value);
    let src = data.buf.ptr().add_uint_offset(ptr_start);
    
    let len = ptr_end - ptr_start;
    if len <= 55 {
        //imbedded immediate length defintion prefix (plus tx type identifier)
        let size = len + 2;
        let prefix = RLP_PAYLOAD_IDENTIFIER_IMMEDIATE_START + len;
        asm(dst: dst, src: src, len: len, size: size, txtype: txtype, prefix: prefix, mem) {
            aloc size; //allocate memory to the stack
            sb hp txtype i1; //set the type identifier 
            sb hp prefix i2; //set the payload prefix
            addi mem hp i3; //increase memory pointer for copying payload items
            mcp  mem src len; //copy the items to the new payload definition
            addi mem hp i1; //move memory pointer back to the beginning
            k256 dst mem size; //hash the new payload
        };
        return to_b256(value);
    }
    if len <= 256 {
        //1 byte length defintion prefix (plus tx type identifier)
        let size = len + 3;
        let prefix = RLP_PAYLOAD_IDENTIFIER_BYTES_START + 1;
        let len0 = len;
        asm(dst: dst, src: src, len: len, size: size, txtype: txtype, prefix: prefix, len0: len0, mem) {
            aloc size; //allocate memory to the stack
            sb hp txtype i1; //set the type identifier 
            sb hp prefix i2; //set the payload prefix
            sb hp len0 i3; //set the payload prefix
            addi mem hp i4; //increase memory pointer for copying payload items
            mcp  mem src len; //copy the items to the new payload definition
            k256 dst hp size; //hash the new payload
        };
        return to_b256(value);
    }
    //TODO: support larger payload sizes

    revert(0);
    ZERO_B256
}

/// RLP Utils ////////////////////////////////////////////////////////////////////////////////////
///
/// Returns the ptr index of where the payload begins and byte length of the payload
fn rlp_decode_payload(data: Bytes, ptr: u64) -> (u64, u64) {
    let payload_identifier = data.get(ptr).unwrap();
    if payload_identifier >= RLP_PAYLOAD_IDENTIFIER_IMMEDIATE_START && payload_identifier <= RLP_PAYLOAD_IDENTIFIER_IMMEDIATE_MAX {
        //immediate length
        let length: u64 = payload_identifier - RLP_PAYLOAD_IDENTIFIER_IMMEDIATE_START;
        return (ptr + 1, length);
    } else if payload_identifier >= RLP_PAYLOAD_IDENTIFIER_BYTES_START && payload_identifier <= RLP_PAYLOAD_IDENTIFIER_BYTES_MAX {
        //get number of bytes to read to figure out the length
        let num_bytes: u64 = payload_identifier - RLP_PAYLOAD_IDENTIFIER_BYTES_START;
        let length = rlp_read_u64(data, ptr + 1, num_bytes);
        return (ptr + 1 + num_bytes, length);
    }

    revert(0);
    (ptr, 0)
}

/// Returns the ptr index of where the item data begins and byte length of the item
fn rlp_decode_item(data: Bytes, ptr: u64) -> (u64, u64) {
    let item_identifier = data.get(ptr).unwrap();
    if item_identifier <= RLP_SINGLE_BYTE_MAX {
        //immediate
        return (ptr, 1);
    } else if item_identifier >= RLP_ITEM_IDENTIFIER_IMMEDIATE_START && item_identifier <= RLP_ITEM_IDENTIFIER_IMMEDIATE_MAX {
        //immediate length
        let length: u64 = item_identifier - RLP_ITEM_IDENTIFIER_IMMEDIATE_START;
        return (ptr + 1, length);
    } else if item_identifier >= RLP_ITEM_IDENTIFIER_BYTES_START && item_identifier <= RLP_ITEM_IDENTIFIER_BYTES_MAX {
        //get number of bytes to read to figure out the length
        let num_bytes: u64 = item_identifier - RLP_ITEM_IDENTIFIER_BYTES_START;
        let length = rlp_read_u64(data, ptr + 1, num_bytes);
        return (ptr + 1 + num_bytes, length);
    }

    revert(0);
    (ptr, 0)
}

/// Returns the u64 representation of the bytes starting from the pointer to num_bytes
fn rlp_read_u64(data: Bytes, ptr: u64, num_bytes: u64) -> u64 {
    if num_bytes > 8 {
        revert(0);
    }
    if num_bytes == 0 {
        return 0;
    }

    //TODO: there's got to be a more efficiet way to do this
    let mut value: (u64, u64) = (0, 0);
    let dst = __addr_of(value).add_uint_offset(16 - num_bytes);
    let src = data.buf.ptr().add_uint_offset(ptr);
    asm(dst: dst, src: src, len: num_bytes) {
        mcp  dst src len;
    };

    value.1
}

/// Returns the b256 representation of the bytes starting from the pointer to num_bytes
fn rlp_read_b256(data: Bytes, ptr: u64, num_bytes: u64) -> b256 {
    if num_bytes > 32 {
        revert(0);
    }
    if num_bytes == 0 {
        return ZERO_B256;
    }

    let mut value: (u64, u64, u64, u64) = (0, 0, 0, 0);
    let dst = __addr_of(value).add_uint_offset(32 - num_bytes);
    let src = data.buf.ptr().add_uint_offset(ptr);
    asm(dst: dst, src: src, len: num_bytes) {
        mcp  dst src len;
    };

    to_b256(value)
}

/// Utils ////////////////////////////////////////////////////////////////////////////////////
///
/// Converts given tuple of words to a b256
//TODO: for some reason, the output of functions has to be wrapped like this or the compiler fails
fn to_b256(words: (u64, u64, u64, u64)) -> b256 {
    asm(r1: __addr_of(words)) { r1: b256 }
}

/// Converts given b256 to a tuple of words
fn to_tuple(bits: b256) -> (u64, u64, u64, u64) {
    asm(r1: __addr_of(bits)) { r1: (u64, u64, u64, u64) }
}

/// Converts given tuple of words to a b256
fn compact_signature(r: b256, s: b256, v: u64) -> B512 {
    let mut s_v = to_tuple(s);
    if v > 0 {
        s_v.0 = (s_v.0 | (1 << 63));
    }
    
    let s_v = to_b256(s_v);
    B512::from((r, s_v))
}
