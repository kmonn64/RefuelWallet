const http = require('http');

//make test calls here
//rpc('{"id":1,"jsonrpc":"2.0","method":"eth_chainId","params":[]}');
//rpc('{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber","params":[]}');
//rpc('{"id":1,"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x167eb1", false]}');
//rpc('{"id":1,"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false]}');

rpc('{"id":1,"jsonrpc":"2.0","method":"eth_getBlockByHash","params":["0x0c491f590abaab55aa035525e74cb05d282c1708ef956348f905da423f11646c", false]}');
rpc('{"id":1,"jsonrpc":"2.0","method":"eth_getBlockByHash","params":["0x0c491f590abaab55aa035525e74cb05d282c1708ef956348f905da423f11646c", true]}');
rpc('{"id":1,"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x7e0ef10d998127ef529e325ff9960cab0462dd3b4b61a26b2064b7020d37a0cc"]}');






function rpc(dataStr) {
	let post_options = {
		host: 'localhost',
		port: '3000',
		path: '/',
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'content-length': Buffer.byteLength(dataStr)
		}
	};
	let rpc = http.request(post_options, function(response) {
		let json = '';
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			json += chunk;
		});
		response.on('end', () => {
			console.log('Test RPC: ' + dataStr);
			console.log('Test RPC Result: ' + json);
			console.log('');
		});
	});
	rpc.write(dataStr);
	rpc.end();
}

