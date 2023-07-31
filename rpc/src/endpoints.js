const fuel = require('./fuel.js');
const config = require('./config.js');
const tl = require('./translator.js');

//TODO: could write more specific queries for getting things like tx count in a block

////////////////////////////////
//////// Public Methods ////////
////////////////////////////////

async function eth_protocolVersion() {
	return config.PROTOCOL_VERSION;
}

async function eth_chainId() {
	return config.FUEL_CHAIN_ID;
}

async function eth_feeHistory(blockCount, newestBlock, percentileValues) {
	// Only allow up to 1024 blocks as the spec defines
	if(blockCount > 1024) blockCount = 1024;

	// Fetch fuel blocks to estimate fee per gas
	let afterBlock = 0;
	if(newestBlock == "latest" || newestBlock == "safe" || newestBlock == "finalized" || newestBlock == "pending") {
		const latestBlock = tl.toNumber(await fuel.blockNumber());
		afterBlock = latestBlock - blockCount;
	} else if(newestBlock != "earliest") {
		if(blockCount > newestBlock) blockCount = newestBlock;
		afterBlock = newestBlock - blockCount;
	}
	const fuelBlocks = await fuel.getBlocks(afterBlock, blockCount, true);

	// Pretend all fees are being paid as priority fees
	let baseFeePerGas = [];
	for(let i=0; i<blockCount + 1; i++) {
		baseFeePerGas.push("0x0");
	}

	// Pretend that blocks are always half full
	let gasUsedRatio = [];
	for(let i=0; i<blockCount; i++) {
		gasUsedRatio.push(0.5);
	}

	// Start building the return
	let result = {
        "baseFeePerGas": baseFeePerGas,
        "gasUsedRatio": gasUsedRatio,
        "oldestBlock": tl.toHexString(afterBlock + 1)
    }

	// Add reward data if percentiles were provided
	if(percentileValues) {

		//TODO: this logic needs to be removed and replaced with the commented lines below
		//NOTE: metamask sets a minimum 1.5gwei gas price so we can't go lower than that
		//NOTE: what metamask shows is the gas price * the estimated gas which right now always returns 2100 (see other TODO in eth_estimateGas)
		let makeMetaMaskSay = 0.0001; //0.0000315
		makeMetaMaskSay = makeMetaMaskSay * 47619047619047.62; //(1000000000000000000 / 21000 = 476190476190476190476.19)
		makeMetaMaskSay = makeMetaMaskSay / 0.97; //NOTE: metamask sets the suggested midrange price to be 97% of what we output here
		let priorityFeePerGas = "0x" + Math.floor(makeMetaMaskSay).toString(16);

		// Report gas fees paid
		let reward = [];
		for(let i=0; i<blockCount; i++) {
			
			//TODO: use the following lines for better gas estimation once we more accuratley report back in eth_estimateGas
			//let priorityFeePerGas = tl.to18Decimals("0x1"); //default to 1 gwei
			//if(i < fuelBlocks.length) priorityFeePerGas = tl.to18Decimals(averageGasForTransactions(fuelBlocks[i].transactions));
			
			let list = [];
			for(let i=0; i<percentileValues.length; i++) list.push(priorityFeePerGas);
			reward.push(list);
		}

		result["reward"] = reward;
	}

	return result;
}

async function eth_gasPrice() {
	// Get the average gas from the latest 10 blocks
	const latestBlocks = await fuel.getLatestBlocks(10, true);
	return averageGasPrice = tl.to18Decimals(averageGasForBlocks(latestBlocks));
}

async function eth_blockNumber() {
	return await fuel.blockNumber();
}

async function eth_getBalance(address, block) {
	if(block == "latest" || block == "safe" || block == "finalized" || block == "pending") {
		return tl.to18Decimals(await fuel.getBalance(address, config.FUEL_BASE_ASSET_ID));
	} else if(block == "earliest") {
		return "0x0";
	}

	// Return the latest balance if the block number given is within 10 blocks of the latest block
	const margin = 10;
	const latestBlockNumber = await fuel.blockNumber();
	if(tl.toNumber(block) > (tl.toNumber(latestBlockNumber) - margin)) {
		return tl.to18Decimals(await fuel.getBalance(address, config.FUEL_BASE_ASSET_ID));
	}

	//TODO: this should be an error reporting that we don't support historical records of balances
	return "0x0";
}

async function eth_getTransactionCount(address, block) {
	//"block" could be hex, "earliest", "latest", "safe", "finalized", "pending"
	
	//TODO: fuels graphql only allows searching for current balance ("latest", "safe", "finalized", "pending") 
	//      or if block number given is only like no more than 10 blocks behind
	//      obviously nonce would be 0 if they set "earliest"
	//TODO: basically return the nonce from the nonce manager
	return "0x1";
}

async function eth_getBlockTransactionCountByHash(blockHash) {
	const fuelBlock = await eth_getBlockByHash(blockHash, false);
	return tl.toHexString(fuelBlock.transactions.length);
}

async function eth_getBlockTransactionCountByNumber(block) {
	const fuelBlock = await eth_getBlockByNumber(block, false);
	return tl.toHexString(fuelBlock.transactions.length);
}

async function eth_sendRawTransaction(rawTx) {
	const txHash = await fuel.submitRefuelTransaction(rawTx);
	return txHash;
}

async function eth_call(tx) {
	//TODO: will need to emulate this for ERC20 contract reads (see ERC20_FUNCTION_SIGNATURES)
	return "0x";
}

async function eth_estimateGas(tx) {
	// Is this a simple ETH transfer?
	if(!tx || !tx.data || tx.data == "0x") return "0x5208"; //21000

	//TODO: if tx is supported transfer, estimate gas, else return protocol block/tx gas limit
	return "0x5208";
}

async function eth_getBlockByHash(blockHash, fullTransactions) {
	return await fuel.getBlockByHash(blockHash, fullTransactions);
}

async function eth_getBlockByNumber(block, fullTransactions) {
	if(block == "latest" || block == "safe" || block == "finalized" || block == "pending") {
		let latestBlocks = await fuel.getLatestBlocks(1, fullTransactions);
		return latestBlocks[0];
	} else if(block == "earliest") {
		return await fuel.getBlockByNumber("0x01", fullTransactions);
	}
	
	return await fuel.getBlockByNumber(block, fullTransactions);
}

async function eth_getTransactionByHash(txHash) {
	return await fuel.getTransactionByHash(txHash);
}

async function eth_getTransactionByBlockHashAndIndex(blockHash, index) {
	const fuelBlock = await eth_getBlockByHash(blockHash, true);
	return fuelBlock.transactions[index];
}

async function eth_getTransactionByBlockNumberAndIndex(block, index) {
	const fuelBlock = await eth_getBlockByNumber(block, true);
	return fuelBlock.transactions[index];
}

async function eth_getTransactionReceipt(txHash) {
	return await fuel.getTransactionByHash(txHash, true);
}

//////////////////////////////////
//////// Helper Functions ////////
//////////////////////////////////

function averageGasForBlocks(blocks) {
	if(blocks.length == 0) return 0;

	let total = 0;
	for(let i=0; i<blocks.length; i++) {
		total += averageGasForTransactions(blocks[i].transactions);
	}
	return Math.floor(total / blocks.length);
}

function averageGasForTransactions(transactions) {
	if(transactions.length == 0) return 0;

	let total = 0;
	for(let i=0; i<transactions.length; i++) {
		total += tl.toNumber(transactions[i].gasPrice);
	}
	return Math.floor(total / transactions.length);
}


/////////////////////////////////
module.exports = {
	eth: {
		protocolVersion: eth_protocolVersion,
		chainId: eth_chainId,
		feeHistory: eth_feeHistory,
		gasPrice: eth_gasPrice,
		blockNumber: eth_blockNumber,
		getBalance: eth_getBalance,
		getTransactionCount: eth_getTransactionCount,
		getBlockTransactionCountByHash: eth_getBlockTransactionCountByHash,
		getBlockTransactionCountByNumber: eth_getBlockTransactionCountByNumber,
		sendRawTransaction: eth_sendRawTransaction,
		call: eth_call,
		estimateGas: eth_estimateGas,
		getBlockByHash: eth_getBlockByHash,
		getBlockByNumber: eth_getBlockByNumber,
		getTransactionByHash: eth_getTransactionByHash,
		getTransactionByBlockHashAndIndex: eth_getTransactionByBlockHashAndIndex,
		getTransactionByBlockNumberAndIndex: eth_getTransactionByBlockNumberAndIndex,
		getTransactionReceipt: eth_getTransactionReceipt
	}
};
