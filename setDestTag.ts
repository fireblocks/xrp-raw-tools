import { FireblocksSDK } from "fireblocks-sdk";
import { RippleAPI, TransactionJSON } from "ripple-lib";
import * as xrp_signer from './src/xrp-signer'
import * as fs from 'fs';
import * as path from 'path'


const API_KEY: string = process.env.FIREBLOCKS_API_KEY;
const PATH_TO_SECRET_KEY: string = process.env.FIREBLOCKS_SECRET_KEY_PATH;
const VAULT_ACCOUNT_ID: number = process.env.VAULT_ACCOUNT_ID;

// see comments if using XRP Testnet
xrp_signer.setAssetId("XRP");                           // change to "XRP_TEST" if using XRP Testnet asset
xrp_signer.setBlockExplorer("https://xrpscan.com/tx");  // change to "https://testnet.xrpl.org/transactions" if using XRP Testnet asset
const SERVER_WSS: string = "wss://xrplcluster.com";     // change to "wss://testnet.xrpl-labs.com" if using XRP Testnet asset

//Enter the domain name as a string, for example: test.com
const DOMAIN: string = "";

// Initialize Fireblocks API Client
const apiKey = API_KEY
const apiSecret = fs.readFileSync(path.resolve(__dirname, PATH_TO_SECRET_KEY), "utf8"); 
const fireblocksApiClient = new FireblocksSDK(apiSecret, apiKey);

const api = new RippleAPI({
  // Public ripple servers
  //'wss://xrplcluster.com', 'wss://s1.ripple.com'
  server: SERVER_WSS
});

async function createTx(account:string){
  const domain: string = DOMAIN ? Buffer.from(DOMAIN.toLowerCase()).toString('hex').toUpperCase() : ""
  
  const transaction: TransactionJSON = {
    "TransactionType": "AccountSet",
    "Account": account,
    "Fee": "1000",
    "Domain": domain,
    "SetFlag": 1 // --> Enable dest tag required 
    //"ClearFlag": 1 // --> Disable test tag required (remove SetFlag in this case)
  }

  await xrp_signer.signAndSubmitTransaction(
    api, 
    fireblocksApiClient, 
    VAULT_ACCOUNT_ID, 
    transaction,
    `Set destination tag required flag for vault account ${VAULT_ACCOUNT_ID}`
  )
}


api.connect().then(async () => {

  const account = await xrp_signer.getAddress(fireblocksApiClient, VAULT_ACCOUNT_ID);
  await createTx(account)
  api.disconnect()
  
});
