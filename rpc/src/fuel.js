const https = require('https');
const ethers = require('ethers');
const fuels = require('fuels');
const config = require('./config.js');
const predicate = require('./predicate.js');
const tl = require('./translator.js');

///////////////////////////
//////// Constants ////////
///////////////////////////

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
const EMPTY_32BYTES = "0x0000000000000000000000000000000000000000000000000000000000000000";
const EMPTY_ROOT_HASH = "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";


/////////////////////////
//////// Queries ////////
/////////////////////////

async function fuel_blockNumber() {
	let query = `
	query BlockNumber($last: Int) {
	  blocks(last: $last) {
		nodes {
		  header {
			height
		  }
		}
	  }
	}`;
	let variables = {
		last: 1
	};
	let result = await graphql(query, variables);
	//TODO: investigate why this somethimes reports blocks that don't actually exist yet
	return tl.toHexString(tl.toNumber(result.data.blocks.nodes[0].header.height) - 1);
}

async function fuel_getBlockByNumber(number, fullTransactions, skipRetry) {
	let query = `
	query BlockByNumber($height: Int) {
	  block(height: $height) {
		header {
		  id
		  transactionsRoot
		  height
		  prevRoot
		  time
		}
		transactions {
		  id
		  gasLimit
		  gasPrice
		  receipts {
			receiptType
			gasUsed
		  }
		}
	  }
	}`;
	let variables = {
		"height": ("" + tl.toNumber(number))
	};
	let result = await graphql(query, variables);
	if(!skipRetry && !(result || result.data || result.data.block)) {
		await await sleep(1000);
		return await fuel_getBlockByNumber(number, fullTransactions, true);
	}
	//TODO: handle null result
	return tl.fuelToEthBlock(result.data.block, fullTransactions);
}

async function fuel_getBlockByHash(blockHash, fullTransactions) {
	let query = `
	query BlockByHash($blockId: BlockId) {
	  block(id: $blockId) {
		header {
		  id
		  transactionsRoot
		  height
		  prevRoot
		  time
		}
		transactions {
		  id
		  gasLimit
		  gasPrice
		  receipts {
			receiptType
			gasUsed
		  }
		}
	  }
	}`;
	let variables = {
		"blockId": blockHash
	};
	let result = await graphql(query, variables);
	//TODO: handle null result
	return tl.fuelToEthBlock(result.data.block, fullTransactions);
}

async function fuel_getLatestBlocks(count, fullTransactions) {
	let query = `
	query LatestBlocks($last: Int) {
	  blocks(last: $last) {
		nodes {
		  header {
			id
			transactionsRoot
			height
			prevRoot
			time
		  }
		  transactions {
			id
			gasLimit
			gasPrice
			receipts {
			  receiptType
			  gasUsed
			}
		  }
		}
	  }
	}`;
	let variables = {
		"last": tl.toNumber(count)
	};
	let result = await graphql(query, variables);
	let blocks = [];
	for(let i=0; i<result.data.blocks.nodes.length; i++) {
		blocks.push(tl.fuelToEthBlock(result.data.blocks.nodes[i], fullTransactions));
	}
	return blocks;
}

async function fuel_getBlocks(after, count, fullTransactions) {
	let query = `
	query Blocks($after: String, $first: Int) {
	  blocks(after: $after, first: $first) {
		nodes {
		  header {
			id
			transactionsRoot
			height
			prevRoot
			time
		  }
		  transactions {
			id
			gasLimit
			gasPrice
			receipts {
			  receiptType
			  gasUsed
			}
		  }
		}
	  }
	}`;
	let variables = {
		"after": "" + tl.toNumber(after),
		"first": tl.toNumber(count)
	};
	let result = await graphql(query, variables);
	let blocks = [];
	for(let i=0; i<result.data.blocks.nodes.length; i++) {
		blocks.push(tl.fuelToEthBlock(result.data.blocks.nodes[i], fullTransactions));
	}
	return blocks;
}

async function fuel_getTransactionByHash(txHash) {
	let query = `
	query TransactionByHash($transactionId: TransactionId!) {
	  transaction(id: $transactionId) {
		gasPrice
		id
		status {
		  ... on SuccessStatus {
			block {
			  transactions {
				id
				gasPrice
				receipts {
				  gasUsed
				  receiptType
				}
			  }
			  header {
				height
				id
			  }
			}
		  }
		  ... on FailureStatus {
			block {
			  transactions {
				id
				gasPrice
				receipts {
				  gasUsed
				  receiptType
				}
			  }
			  header {
				height
				id
			  }
			}
		  }
		}
		receipts {
		  receiptType
		  gasUsed
		}
	  }
	}`;
	let variables = {
		"transactionId": txHash
	};
	let result = await graphql(query, variables);
	//TODO: handle null result
	return tl.fuelToEthTx(result.data.transaction, result.data.transaction.status.block);
}

async function fuel_getBalance(address, assetId) {
	let query = `
	query Balance($owner: Address!, $assetId: AssetId!) {
		balance(owner: $owner, assetId: $assetId) {
		  amount
		}
	  }`;
	let variables = {
		owner: tl.toFuelAddress(address),
		assetId: assetId
	};
	let result = await graphql(query, variables);
	//TODO: handle null result
	return tl.toHexString(result.data.balance.amount);
}

async function fuel_getCoinsToSpend(owner, assetId, amount) {
	let query = `
	query CoinsToSpend($owner: Address!, $queryPerAsset: [SpendQueryElementInput!]!) {
		resourcesToSpend(owner: $owner, queryPerAsset: $queryPerAsset) {
		  ... on Coin {
			amount
			assetId
			utxoId
			blockCreated
		  }
		}
	  }`;
	let variables = {
		owner: owner,
		queryPerAsset: [{
			amount: "" + tl.toNumber(amount),
			assetId: assetId
		}]
	};
	let result = await graphql(query, variables);
	//TODO: handle null result
	return result.data.resourcesToSpend[0];
}

/////////////////////////
//////// Actions ////////
/////////////////////////

// Generates a raw fuel transaction from the signed EVM transaction
async function submitRefuelTransaction(rawSignedTx) {
	let txObject = null;

	//TODO: add support for other transaction types
	if(rawSignedTx.substr(0,4) == '0x02') {
		const txDecode = ethers.utils.RLP.decode('0x' + rawSignedTx.substr(4));
		const expandedSig = {
			r: txDecode[10],
			s: txDecode[11],
			v: ethers.BigNumber.from(txDecode[9].padEnd(4, "0")).add(27).toNumber(),
		};
		const signature = ethers.utils.joinSignature(expandedSig);
		const rawTx = '0x02' + ethers.utils.RLP.encode(JSON.parse(JSON.stringify(txDecode)).slice(0, -3)).substr(2);
		const msgBytes = ethers.utils.arrayify(ethers.utils.keccak256(rawTx));
		const from = ethers.utils.recoverAddress(msgBytes, signature).toLowerCase();

		txObject = {
			rawSignedTx: rawSignedTx,
			from: from,
			chainId: txDecode[0].toLowerCase(),
			nonce: txDecode[1].toLowerCase(),
			maxPriorityFeePerGas: txDecode[2].toLowerCase(),
			maxFeePerGas: txDecode[3].toLowerCase(),
			gasLimit: txDecode[4].toLowerCase(),
			to: txDecode[5].toLowerCase(),
			value: txDecode[6].toLowerCase(),
			data: txDecode[7].toLowerCase(),
			accessList: txDecode[8],
			v: txDecode[9].toLowerCase(),
			r: txDecode[10].toLowerCase(),
			s: txDecode[11].toLowerCase()
		}
	}

	if(txObject) {
		const provider = new fuels.Provider(config.FUEL_NETWORK_URL);
		const refuelPredicate = new fuels.Predicate(predicate.bytecode(txObject.from), undefined, provider);
		refuelPredicate.setData(ethers.arrayify(rawSignedTx));
/*
{
  rawSignedTx: '0x02f87783097bc80185011bd4e67985011bd4e67982520894dc8903ca414cbd8b1c13da93d3310d516f686fbf88016345785d8a000080c001a0ca220e371441b35bc55913e5414c20c588651480401fc2b980fbca7005434e86a072ebc6aaeb36a66af1b6fefa9368ce1fe55b2da0ef18d41d02811d1fa01289d9',
  from: '0x17320E6E3904206703B4eE4617AAbe61402988f4',
  chainId: '0x097bc8',
  nonce: '0x01',
  maxPriorityFeePerGas: '0x011bd4e679',
  maxFeePerGas: '0x011bd4e679',
  gasLimit: '0x5208',
  to: '0xdc8903ca414cbd8b1c13da93d3310d516f686fbf',
  value: '0x016345785d8a0000',
  data: '0x',
  accessList: [],
  v: '0x01',
  r: '0xca220e371441b35bc55913e5414c20c588651480401fc2b980fbca7005434e86',
  s: '0x72ebc6aaeb36a66af1b6fefa9368ce1fe55b2da0ef18d41d02811d1fa01289d9'
}
*/

		//TODO: add support for ERC20 transfers and other conversions
		if(txObject.data == "0x") {
			let coins = await refuelPredicate.getCoins(config.FUEL_BASE_ASSET_ID);
			console.log("coins")
			console.log(coins)










			//TODO

		}
	}

	//TODO: return a more helpful tx hash
	return "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331";
}


///////////////////////////////
//////// Graphql Utils ////////
///////////////////////////////

async function graphql(query, variables) {
	//TODO: need better error handling (rejectnot even used)
	return new Promise((resolve, reject) => {
		let dataStr = JSON.stringify({
		  query,
		  variables,
		});
		let post_options = {
			host: config.FUEL_GRAPHQL_HOST,
			path: config.FUEL_GRAPHQL_PATH,
			method: 'POST',
			headers: {
				'accept': 'application/json',
				'content-type': 'application/json',
				'content-length': Buffer.byteLength(dataStr)
			}
		};
		let graphql = https.request(post_options, function(response) {
			let json = '';
			response.setEncoding('utf8');
			response.on('data', function (chunk) {
				json += chunk;
			});
			response.on('end', () => {
				try {
					resolve(JSON.parse(json));
				} catch(e) {
					console.log('[error] invalid response from graphql');
					console.log(json);
				}
			});
		});
		graphql.write(dataStr);
		graphql.end();
	});
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/////////////////////////////////
module.exports = {
	blockNumber: fuel_blockNumber,
	getBlockByNumber: fuel_getBlockByNumber,
	getBlockByHash: fuel_getBlockByHash,
	getLatestBlocks: fuel_getLatestBlocks,
	getBlocks: fuel_getBlocks,
	getTransactionByHash: fuel_getTransactionByHash,
	getBalance: fuel_getBalance,
	getCoinsToSpend: fuel_getCoinsToSpend,
	submitRefuelTransaction: submitRefuelTransaction
};
