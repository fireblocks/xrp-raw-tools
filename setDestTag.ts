import { FireblocksSDK } from "fireblocks-sdk";
import { RippleAPI, TransactionJSON } from "ripple-lib";
import * as xrp_signer from './src/xrp-signer'
import * as fs from 'fs';
import * as path from 'path'


require('dotenv').config();

const API_KEY = process.env.FIREBLOCKS_API_KEY;
const PATH_TO_SECRET_KEY = process.env.FIREBLOCKS_SECRET_KEY_PATH;

// Change to your Vault Account ID
const VAULT_ACCOUNT_ID: number = 1; 

//Enter the domain name as a string, for example: test.com
const DOMAIN: string = null 



// Initialize Fireblocks API Client
const apiKey = API_KEY
const apiSecret = fs.readFileSync(path.resolve(__dirname, PATH_TO_SECRET_KEY), "utf8"); 
const fireblocksApiClient = new FireblocksSDK(apiSecret, apiKey);

const api = new RippleAPI({
  // Public ripple servers
  //'wss://xrplcluster.com', 'wss://s1.ripple.com'
  server: 'wss://xrplcluster.com'
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
