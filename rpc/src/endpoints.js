const fuel = require('./fuel.js');
const config = require('./config');

//TODO: could write more specific queries for getting things like tx count in a block

////////////////////////////////
//////// Public Methods ////////
////////////////////////////////

async function eth_protocolVersion() {
	return config.PROTOCOL_VERSION;
}

async function eth_chainId() {
	return config.CHAIN_ID;
}
	
async function eth_gasPrice() {
	//TODO: maybe grab the latest 10 blocks or so and get the average baseFeePerGas accross them
	return "0x1dfd14000";
}

async function eth_blockNumber() {
	return await fuel.blockNumber();
}

async function eth_getBalance(address, block) {
	//"block" could be hex, "earliest", "latest", "safe", "finalized", "pending"
	//TODO: fuels graphql only allows searching for current balance ("latest", "safe", "finalized", "pending") 
	//      or if block number given is only like no more than 10 blocks behind
	return "0x0234c8a3397aab58";
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
	//TODO: see eth_getBlockByHash
	return "0xb";
}

async function eth_getBlockTransactionCountByNumber(block) {
	//"block" could be hex, "earliest", "latest", "safe", "finalized", "pending"
	//TODO: see eth_getBlockByNumber
	return "0xa";
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
	//TODO: first fetch block to get txHash
	return {};
}

async function eth_getTransactionByBlockNumberAndIndex(block, index) {
	//TODO: first fetch block to get txHash
	return {};
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
