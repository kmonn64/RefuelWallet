const ethers = require('ethers');
const fuels = require('fuels');
const config = require('./config.js');

////////////////////////////////
//////// Public Methods ////////
////////////////////////////////

function bytecode(address) {
	let bytes = ethers.utils.arrayify(PREDICATE_BYTECODE_HEX);
	if(address) {
		let addressBytes = ethers.utils.arrayify(address);

    	// pad with zeros to the nearest 8 bytes (u64)
		let toPad = 8 - (bytes.length % 8);
		if(toPad < 8) {
			let oldBytes = bytes;
			bytes = new Uint8Array(bytes.length + toPad)
			bytes.set(oldBytes);
		}

		// add the public address to the end of the predicate
		let oldBytes = bytes;
		bytes = new Uint8Array(bytes.length + 32)
		bytes.set(oldBytes);
		bytes.set(addressBytes, oldBytes.length + 12);
	}

	return bytes;
}

function root(address) {
	let bytes = bytecode(address);
	const refuelPredicate = new fuels.Predicate(bytes);

	if(config.OUTPUT_ADDRESS_CONVERSION) console.log("[info] " + address + " -> " + refuelPredicate.address.toHexString() + " -> " + refuelPredicate.address.toAddress());
	
	return refuelPredicate.address.toHexString();
}

function abi() {
	return PREDICATE_JSON_ABI;
}

/////////////////////////////////
module.exports = {
	bytecode: bytecode,
	root: root,
	abi: abi
};

///////////////////////////
//////// Constants ////////
///////////////////////////

const PREDICATE_JSON_ABI = {
	"types": [
	  {
		"typeId": 0,
		"type": "bool",
		"components": null,
		"typeParameters": null
	  },
	  {
		"typeId": 1,
		"type": "raw untyped ptr",
		"components": null,
		"typeParameters": null
	  },
	  {
		"typeId": 2,
		"type": "struct Bytes",
		"components": [
		  {
			"name": "buf",
			"type": 3,
			"typeArguments": null
		  },
		  {
			"name": "len",
			"type": 4,
			"typeArguments": null
		  }
		],
		"typeParameters": null
	  },
	  {
		"typeId": 3,
		"type": "struct RawBytes",
		"components": [
		  {
			"name": "ptr",
			"type": 1,
			"typeArguments": null
		  },
		  {
			"name": "cap",
			"type": 4,
			"typeArguments": null
		  }
		],
		"typeParameters": null
	  },
	  {
		"typeId": 4,
		"type": "u64",
		"components": null,
		"typeParameters": null
	  }
	],
	"functions": [
	  {
		"inputs": [
		  {
			"name": "signed_tx",
			"type": 2,
			"typeArguments": null
		  }
		],
		"name": "main",
		"output": {
		  "name": "",
		  "type": 0,
		  "typeArguments": null
		},
		"attributes": [
		  {
			"name": "doc-comment",
			"arguments": [
			  " Predicate verifying a transaction was contructed according to a signed evm transaction"
			]
		  }
		]
	  }
	],
	"loggedTypes": [],
	"messagesTypes": [],
	"configurables": []
  };

const PREDICATE_BYTECODE_HEX = "0x9000000447000000000000000000004C5DFCC00110FFF30071480003614521017344000B6141210D9000001272400002134114005A410001734000116141211F900000122400000024040000";
