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
	
async function eth_gasPrice() {
	// Get the latest 10 blocks from the fuel module
	const latestBlocks = await fuel.getLatestBlocks(10, true);

	// Calculate the average gas price from the latest blocks
	var totalGasPrice = 0;
	for (let i=0; i<latestBlocks.length; i++) {
		const gasPrice = parseInt(latestBlocks[i].baseFeePerGas, 16);
		totalGasPrice += gasPrice;
	}

	// Calculate the average gas price
	const averageGasPrice = tl.toHexString(floor(totalGasPrice / latestBlocks.length));
	return averageGasPrice;
}

async function eth_blockNumber() {
	return await fuel.blockNumber();
}

async function eth_getBalance(address, block) {
	if(block == "latest" || block == "safe" || block == "finalized" || block == "pending") {
		return fuel.fuel_getBalance(address, config.FUEL_BASE_ASSET_ID);
	} else if(block == "earliest") {
		return 0;
	}

	// Return the latest balance if the block number given is within 10 blocks of the latest block
	const margin = 10;
	const latestBlockNumber = await fuel.blockNumber();
	if(tl.toNumber(block) > (tl.toNumber(latestBlockNumber) - margin)) {
		return fuel.fuel_getBalance(address, config.FUEL_BASE_ASSET_ID);
	}

	//TODO: this should be an error reporting that we don't support historical records of balances
	return 0;
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
	//TODO
	return "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"; //tx hash
}

async function eth_call(tx, block) {
	//"block" could be hex, "earliest", "latest", "safe", "finalized", "pending"
	//TODO: will need to emulate this for ERC20 contract reads (see ERC20_FUNCTION_SIGNATURES)
	return "0x";
}

async function eth_estimateGas(tx, block) {
	//"block" could be hex, "earliest", "latest", "safe", "finalized", "pending"
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
	return fuel.getTransactionByHash(txHash);
}

async function eth_getTransactionByBlockHashAndIndex(blockHash, index) {
	const fuelBlock = await eth_getBlockByHash(blockHash, true);
	return fuelBlock.transactions[index];
}

async function eth_getTransactionByBlockNumberAndIndex(block, index) {
	const fuelBlock = await eth_getBlockByNumber(block, true);
	return fuelBlock.transactions[index];
}


/////////////////////////////////
module.exports = {
	eth: {
		protocolVersion: eth_protocolVersion,
		chainId: eth_chainId,
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
		getTransactionByBlockNumberAndIndex: eth_getTransactionByBlockNumberAndIndex
	}
};
