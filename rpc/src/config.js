
///////////////////////////
//////// Constants ////////
///////////////////////////

const FUEL_NETWORK_URL = "https://beta-3.fuel.network/graphql";
const FUEL_GRAPHQL_HOST = "beta-3.fuel.network";
const FUEL_GRAPHQL_PATH = "/graphql";
const FUEL_BLOCK_GAS_LIMIT = "0x2540be400"; //10m
const FUEL_PROTOCOL_VERSION = "0x41";
const FUEL_CHAIN_ID = "0x97BC8"; //621512 (f u e l -> 6 21 5 12)
const FUEL_BASE_ASSET_ID = "0x0000000000000000000000000000000000000000000000000000000000000000";

const SERVER_PORT = 3000;
const OUTPUT_CALL_LOG = true;
const OUTPUT_ADDRESS_CONVERSION = false;


/////////////////////////////////
module.exports = {
	FUEL_NETWORK_URL: FUEL_NETWORK_URL,
	FUEL_GRAPHQL_HOST: FUEL_GRAPHQL_HOST,
	FUEL_GRAPHQL_PATH: FUEL_GRAPHQL_PATH,
	FUEL_BLOCK_GAS_LIMIT: FUEL_BLOCK_GAS_LIMIT,
	FUEL_PROTOCOL_VERSION: FUEL_PROTOCOL_VERSION,
	FUEL_CHAIN_ID: FUEL_CHAIN_ID,
	FUEL_BASE_ASSET_ID: FUEL_BASE_ASSET_ID,
	SERVER_PORT: SERVER_PORT,
	OUTPUT_CALL_LOG: OUTPUT_CALL_LOG,
	OUTPUT_ADDRESS_CONVERSION: OUTPUT_ADDRESS_CONVERSION
};
