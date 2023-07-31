const https = require('https');
const ethers = require('ethers');
const config = require('./config.js');
const predicate = require('./predicate.js');

///////////////////////////
//////// Constants ////////
///////////////////////////

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
const EMPTY_32BYTES = "0x0000000000000000000000000000000000000000000000000000000000000000";
const EMPTY_ROOT_HASH = "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";


//////////////////////////////////
//////// Data Translators ////////
//////////////////////////////////

function fuelToEthBlock(fuelBlock, fullTransactions) {
	//calculate gas usage values
	let gasUsed = 0;
	let count = 0;
	for(let i=0; i<fuelBlock.transactions.length; i++) {
		if(fuelBlock.transactions[i].gasPrice) { //ignore mint transactions
			for(let j=0; j<fuelBlock.transactions[i].receipts.length; j++) {
				if(fuelBlock.transactions[i].receipts[j].receiptType == "SCRIPT_RESULT") {
					gasUsed += toNumber(fuelBlock.transactions[i].receipts[j].gasUsed);
					break;
				}
			}
			count++;
		}
	}
	
	//fill in transactions
	let transactions = [];
	for(let i=0; i<fuelBlock.transactions.length; i++) {
		if(fullTransactions) {
			transactions.push(fuelToEthTx(fuelBlock.transactions[i], fuelBlock));
		} else {
			transactions.push(fuelBlock.transactions[i].id);
		}
	}
	
	return {
		"baseFeePerGas": "0x0",
		"difficulty": "0x0",
		"extraData": "0x",
		"gasLimit": config.BLOCK_GAS_LIMIT,
		"gasUsed": toHexString(gasUsed), //ex. "0x492a7d"
		"hash": fuelBlock.header.id, //ex. "0x81e01bd347a2adc523d952537b53b68deb001da1881d719eace43bbaa03c37a9"
		"logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
		"miner": EMPTY_ADDRESS,
		"mixHash": "0xf5eba5b97e30efaa3375e825439dfacb3da632577a6beab7fbdadd9f36d05be1",
		"nonce": "0x0000000000000000",
		"number": toHexString(fuelBlock.header.height), //ex. "0x3b14bf"
		"parentHash": fuelBlock.prevRoot, //ex. "0x2ac47633ea5cb40bce35fb7cd1e31a9648654d7388272f6d0b241779f08ea5b3"
		"receiptsRoot": EMPTY_ROOT_HASH,
		"sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
		"size": "0xf4240",
		"stateRoot": EMPTY_ROOT_HASH,
		"timestamp": toHexString(toSecondsFromTai64(fuelBlock.header.time)), //ex. "0x64ada014"
		"totalDifficulty": "0x3c656d23029ab0",
		"transactions": transactions,
		"transactionsRoot": fuelBlock.header.transactionsRoot, //ex. "0x1bc384118ab3aa1c7b7f7f97254aa6a24ecf2be7e09ae06a5da5eb20ad3d4cf3"
		"uncles": [],
		"withdrawals": [],
		"withdrawalsRoot": EMPTY_ROOT_HASH
	}
}

function fuelToEthTx(fuelTx, fuelBlock) {
	//TODO: these extra details can be inferred about a transaction by looking at the predicate data on some of the inputs and parsing the raw signed evm tx
	let cachedDetails = {
		"from": EMPTY_ADDRESS,
		"input": "0x",
		"nonce": "0x0",
		"to": EMPTY_ADDRESS,
		"value": "0x0",
		"v": "0x25",
		"r": EMPTY_32BYTES,
		"s": EMPTY_32BYTES
	};
	
	//determine index
	let index = 0;
	for(let i=0; i<fuelBlock.transactions.length; i++) {
		if(fuelBlock.transactions[i].id.toLowerCase() == fuelTx.id.toLowerCase()) {
			index = i;
			break;
		}
	}
	
	//get gas data
	let gasUsed = 0;
	let gasPrice = 0;
	if(fuelTx.gasPrice) {
		for(let i=0; i<fuelTx.receipts.length; i++) {
			if(fuelTx.receipts[i].receiptType == "SCRIPT_RESULT") {
				gasUsed = toNumber(fuelTx.receipts[i].gasUsed);
				break;
			}
		}
		gasPrice = toNumber(fuelTx.gasPrice);
		
	} else {
		
		//use average values for mint transactions (no explicit gas price)
		let count = 0;
		for(let i=0; i<fuelBlock.transactions.length; i++) {
			if(fuelBlock.transactions[i].gasPrice) { //ignore mint transactions
				for(let j=0; j<fuelBlock.transactions[i].receipts.length; j++) {
					if(fuelBlock.transactions[i].receipts[j].receiptType == "SCRIPT_RESULT") {
						gasUsed += toNumber(fuelBlock.transactions[i].receipts[j].gasUsed);
						break;
					}
				}
				gasPrice += toNumber(fuelBlock.transactions[i].gasPrice);
				count++;
			}
		}
		if(count > 0) gasUsed = Math.ceil(gasUsed / count);
		if(count > 0) gasPrice = Math.ceil(gasPrice / count);
	}
	
	return {
		"accessList":[],
		"blockHash": fuelBlock.header.id, //ex. "0x1d59ff54b1eb26b013ce3cb5fc9dab3705b415a67127a003c3e61eb445bb8df2"
		"blockNumber": toHexString(fuelBlock.header.height), //ex. "0x5daf3b"
		"chainId": config.FUEL_CHAIN_ID, //ex. "0x1"
		"from": cachedDetails.from,
		"gas": toHexString(gasUsed), //ex. "0xc350"
		"gasPrice": to18Decimals(gasPrice), //ex. "0x4a817c800"
		"hash": fuelTx.id, //ex. "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"
		"input": cachedDetails.input,
		"maxFeePerGas": to18Decimals(gasPrice), //ex. "0x6a71606ce"
		"maxPriorityFeePerGas": to18Decimals(gasPrice), //ex. "0x6a71606ce"
		"nonce": cachedDetails.nonce,
		"to": cachedDetails.to,
		"type": "0x2",
		"transactionIndex": toHexString(index), //ex. "0x41"
		"value": cachedDetails.value,
		"v": cachedDetails.v,
		"r": cachedDetails.r,
		"s": cachedDetails.s
	}
}

function fuelToEthTxReceipt(fuelTx, fuelBlock) {
	//TODO: these extra details can be inferred about a transaction by looking at the predicate data on some of the inputs and parsing the raw signed evm tx
	let cachedDetails = {
		"from": EMPTY_ADDRESS,
		"input": "0x",
		"nonce": "0x0",
		"to": EMPTY_ADDRESS,
		"value": "0x0",
		"v": "0x25",
		"r": EMPTY_32BYTES,
		"s": EMPTY_32BYTES
	};
	
	//determine index
	let index = 0;
	for(let i=0; i<fuelBlock.transactions.length; i++) {
		if(fuelBlock.transactions[i].id.toLowerCase() == fuelTx.id.toLowerCase()) {
			index = i;
			break;
		}
	}
	
	//get gas data
	let gasUsed = 0;
	let gasPrice = 0;
	if(fuelTx.gasPrice) {
		for(let i=0; i<fuelTx.receipts.length; i++) {
			if(fuelTx.receipts[i].receiptType == "SCRIPT_RESULT") {
				gasUsed = toNumber(fuelTx.receipts[i].gasUsed);
				break;
			}
		}
		gasPrice = toNumber(fuelTx.gasPrice);
		
	} else {
		
		//use average values for mint transactions (no explicit gas price)
		let count = 0;
		for(let i=0; i<fuelBlock.transactions.length; i++) {
			if(fuelBlock.transactions[i].gasPrice) { //ignore mint transactions
				for(let j=0; j<fuelBlock.transactions[i].receipts.length; j++) {
					if(fuelBlock.transactions[i].receipts[j].receiptType == "SCRIPT_RESULT") {
						gasUsed += toNumber(fuelBlock.transactions[i].receipts[j].gasUsed);
						break;
					}
				}
				gasPrice += toNumber(fuelBlock.transactions[i].gasPrice);
				count++;
			}
		}
		if(count > 0) gasUsed = Math.ceil(gasUsed / count);
		if(count > 0) gasPrice = Math.ceil(gasPrice / count);
	}

	return {
		"blockHash": fuelBlock.header.id,
		"blockNumber": toHexString(fuelBlock.header.height), //ex. "0x5daf3b"
		"contractAddress": null,
		"cumulativeGasUsed": toHexString(gasUsed), //ex. "0xa12515"
		"effectiveGasPrice": to18Decimals(gasPrice), //ex. "0x5a9c688d4"
		"from": cachedDetails.from,
		"gasUsed": toHexString(gasUsed), //ex. "0xb4c8",
		"logs": [],
		"logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // 256 byte bloom filter
		"status": "0x1", //TODO: determine legitimate status
		"to": cachedDetails.to,
		"transactionHash": fuelTx.id.toLowerCase(),
		"transactionIndex": toHexString(index), //ex. "0x66",
		"type": "0x2"
	  }
}

function toFuelAddress(ethAddress) {
	return predicate.root(ethAddress);
}

function toHexString(numberish) {
	return ethers.BigNumber.from(numberish).toHexString();
}

function toNumber(numberish) {
	return ethers.BigNumber.from(numberish).toNumber();
}

function to18Decimals(numberish) {
	return ethers.BigNumber.from(numberish).mul(1000000000).toHexString();
}

function to9Decimals(numberish) {
	return ethers.BigNumber.from(numberish).div(1000000000).toHexString();
}


//////////////////////////////////
//////// Data Translators ////////
//////////////////////////////////

function toSecondsFromTai64(tai64) {
    const zeroPointOffset = '4611686018427387914';
    return ethers.BigNumber.from(tai64).sub(zeroPointOffset).toNumber();
}


/////////////////////////////////
module.exports = {
	fuelToEthBlock: fuelToEthBlock,
	fuelToEthTx: fuelToEthTx,
	fuelToEthTxReceipt: fuelToEthTxReceipt,
	toFuelAddress: toFuelAddress,
	toHexString: toHexString,
	toNumber: toNumber,
	to18Decimals: to18Decimals,
	to9Decimals: to9Decimals
};
