const https = require('https');
const ethers = require('ethers');
const config = require('./config.js');
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
	//this is a test query to get the balance of an address
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
	return tl.toHexString(result.data.balance.amount);
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
	getBalance: fuel_getBalance
};
