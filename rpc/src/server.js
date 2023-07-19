// Core
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const eth = require('./endpoints.js').eth;


///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Serve App ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
const serverPort = 3000;
const debugOutput = true;
const app = express();
app.use(bodyParser.json());


// Test GETs
app.get('/test', function (req, res) {
	res.send('this is a test');
});

// Forward POSTs
app.post('*', async (req, res) => {
    let data = req.body;
    let dataStr = JSON.stringify(data); 
	
	const protocolVersion = "0x41";
	const chainId = "0x97BC8"; //621512
	
	if(data.jsonrpc == "2.0") {
		let response = {
			"jsonrpc": "2.0",
			"id": data.id
		}
			
		if(debugOutput) console.log("[info] " + data.method + " called");
		if(data.method == 'eth_protocolVersion') {
			returnResponse(response, res, await eth.protocolVersion());
			
		} else if(data.method == 'eth_syncing') {
			returnResponse(response, res, false);
			
		} else if(data.method == 'eth_coinbase') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_chainId') {
			returnResponse(response, res, await eth.chainId());
			
		} else if(data.method == 'eth_mining') {
			returnResponse(response, res, false);
			
		} else if(data.method == 'eth_hashrate') {
			returnResponse(response, res, "0x0");
			
		} else if(data.method == 'eth_gasPrice') {
			returnResponse(response, res, await eth.gasPrice());
			
		} else if(data.method == 'eth_accounts') {
			returnResponse(response, res, []);
			
		} else if(data.method == 'eth_blockNumber') {
			returnResponse(response, res, await eth.blockNumber());
			
		} else if(data.method == 'eth_getBalance') {
			let params = validateParams(response, res, data.params, [pt_address, pt_block]);
			if(params) returnResponse(response, res, await eth.getBalance(params[0], params[1]));
			
		} else if(data.method == 'eth_getStorageAt') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_getTransactionCount') {
			let params = validateParams(response, res, data.params, [pt_address, pt_block]);
			if(params) returnResponse(response, res, await eth.getTransactionCount(params[0], params[1]));
			
		} else if(data.method == 'eth_getBlockTransactionCountByHash') {
			let params = validateParams(response, res, data.params, [pt_hash]);
			if(params) returnResponse(response, res, await eth.getBlockTransactionCountByHash(params[0]));
			
		} else if(data.method == 'eth_getBlockTransactionCountByNumber') {
			let params = validateParams(response, res, data.params, [pt_block]);
			if(params) returnResponse(response, res, await eth.getBlockTransactionCountByNumber(params[0]));
			
		} else if(data.method == 'eth_getUncleCountByBlockHash') {
			returnResponse(response, res, "0x0");
			
		} else if(data.method == 'eth_getUncleCountByBlockNumber') {
			returnResponse(response, res, "0x0");
			
		} else if(data.method == 'eth_getCode') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_sign') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_signTransaction') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_sendTransaction') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_sendRawTransaction') {
			let params = validateParams(response, res, data.params, [pt_bytes]);
			if(params) returnResponse(response, res, await eth.sendRawTransaction(params[0]));
			
		} else if(data.method == 'eth_call') {
			let params = validateParams(response, res, data.params, [pt_tx, pt_block]);
			if(params) returnResponse(response, res, await eth.call(params[0], params[1]));
			
		} else if(data.method == 'eth_estimateGas') {
			let params = validateParams(response, res, data.params, [pt_tx, pt_block]);
			if(params) returnResponse(response, res, await eth.estimateGas(params[0], params[1]));
			
		} else if(data.method == 'eth_getBlockByHash') {
			let params = validateParams(response, res, data.params, [pt_hash, pt_bool]);
			if(params) returnResponse(response, res, await eth.getBlockByHash(params[0], params[1]));
			
		} else if(data.method == 'eth_getBlockByNumber') {
			let params = validateParams(response, res, data.params, [pt_block, pt_bool]);
			if(params) returnResponse(response, res, await eth.getBlockByNumber(params[0], params[1]));
			
		} else if(data.method == 'eth_getTransactionByHash') {
			let params = validateParams(response, res, data.params, [pt_hash]);
			if(params) returnResponse(response, res, await eth.getTransactionByHash(params[0]));
			
		} else if(data.method == 'eth_getTransactionByBlockHashAndIndex') {
			let params = validateParams(response, res, data.params, [pt_hash, pt_integer]);
			if(params) returnResponse(response, res, await eth.getTransactionByBlockHashAndIndex(params[0], params[1]));
			
		} else if(data.method == 'eth_getTransactionByBlockNumberAndIndex') {
			let params = validateParams(response, res, data.params, [pt_block, pt_integer]);
			if(params) returnResponse(response, res, await eth.getTransactionByBlockNumberAndIndex(params[0], params[1]));
			
		} else if(data.method == 'eth_getTransactionReceipt') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_getUncleByBlockHashAndIndex') {
			returnResponse(response, res, null);
			
		} else if(data.method == 'eth_getUncleByBlockNumberAndIndex') {
			returnResponse(response, res, null);
			
		} else if(data.method == 'eth_getCompilers') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_compileSolidity') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_compileLLL') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_compileSerpent') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_newFilter') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_newBlockFilter') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_newPendingTransactionFilter') {
			returnError(response, res, data.method); //not supported by infura
			
		} else if(data.method == 'eth_uninstallFilter') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_getFilterChanges') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_getFilterLogs') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_getLogs') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_getWork') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_submitWork') {
			returnError(response, res, data.method);
			
		} else if(data.method == 'eth_submitHashrate') {
			returnError(response, res, data.method);
			
		} else {
			returnError(response, res, data.method);
		}
	}
})

// Response handler
function returnResponse(jsonRes, postRes, result) {
	//TODO: need to handle if result is null
	jsonRes.result = result;
	postRes.send(JSON.stringify(jsonRes));
}

// Error handler
function returnError(jsonRes, postRes, methodName) {
	if(debugOutput) console.log("[error] method " + methodName + " not supported");
	jsonRes.error = {
		"code":-32601,
		"message":"The method " + methodName + " does not exist/is not available"
	};
	postRes.send(JSON.stringify(jsonRes));
}

// Parse parameters
const pt_address = 0;
const pt_block = 1;
const pt_bytes = 2;
const pt_hash = 3;
const pt_tx = 4;
const pt_bool = 5;
const pt_integer = 6;
function validateParams(jsonRes, postRes, params, expectations) {
	sanitizedParams = [];
	for(let i=0; i<expectations.length; i++) {
		if(params.length > i) {
			const item = params[i];
			
			if(expectations[i] == pt_address) {
				if(validateHex(item) && item.length <= 42) {
					sanitizedParams[i] = '0x' + item.toLowerCase().substring(2).padStart(40, '0');
					continue;
				}
				console.log("[error] unknown value for address:");
				console.log(item);
				
			} else if(expectations[i] == pt_block) {
				if(validateHex(item) && item.length <= 66) {
					sanitizedParams[i] = item.toLowerCase();
					continue;
				} else if(item == "earliest" || item == "latest" || item == "safe" || item == "finalized" || item == "pending") {
					sanitizedParams[i] = item;
					continue;
				}
				console.log("[error] unknown value for block:");
				console.log(item);
				
			} else if(expectations[i] == pt_bytes) {
				if(validateHex(item) && (item.length % 2) == 0) {
					sanitizedParams[i] = item.toLowerCase();
					continue;
				}
				console.log("[error] unknown value for bytes:");
				console.log(item);
				
			} else if(expectations[i] == pt_hash) {
				if(validateHex(item) && item.length <= 66) {
					sanitizedParams[i] = '0x' + item.toLowerCase().substring(2).padStart(64, '0');
					continue;
				}
				console.log("[error] unknown value for hash:");
				console.log(item);
				
			} else if(expectations[i] == pt_tx) {
				//TODO: validate more than just if item is an object
				if(typeof item === 'object' && !Array.isArray(item) && item !== null) {
					sanitizedParams[i] = item;
					continue;
				}
				console.log("[error] unknown value for tx:");
				console.log(item);
				
			} else if(expectations[i] == pt_bool) {
				if(typeof item == "boolean") {
					sanitizedParams[i] = item;
					continue;
				} else if(item == "true" || item == "false") {
					sanitizedParams[i] = (item == "true");
					continue;
				}
				console.log("[error] unknown value for bool:");
				console.log(item);
				
			} else if(expectations[i] == pt_integer) {
				if(Number.isInteger(item)) {
					sanitizedParams[i] = item;
					continue;
				} else if(validateHex(item) && !isNaN(parseInt(item, 16))) {
					sanitizedParams[i] = parseInt(item, 16);
					continue;
				} else if(!isNaN(parseInt(item))) {
					sanitizedParams[i] = parseInt(item);
					continue;
				}
				console.log("[error] unknown value for integer:");
				console.log(item);
				
			}
		}

		//error message
		jsonRes.error = {
			"code": -32602,
			"message": "could not unmarshal parameter " + i
		};
		postRes.send(JSON.stringify(jsonRes));
		return null;
	}
	
	return sanitizedParams;
}
function validateHex(str) {
	const hexChars = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','A','B','C','D','E','F'];
	if(!(typeof str === 'string' || str instanceof String)) return false;
	if(str.length < 2 || str[0] != '0' || str[1] != 'x') return false;
	for(let i=2; i<str.length; i++) {
		if(hexChars.indexOf(str[i]) == -1) return false;
	}
	return true;
}

// Error handling
app.use(function (err, req, res, next) {
	if (req.xhr) {
		res.status(500).send('Oops, Something went wrong!');
	} else {
		next(err);
	}
});

// Start Express App Server
app.listen(serverPort);
console.log('RPC Server is listening on port ' + serverPort);
