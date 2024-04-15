<p align="center">
  <img src="./logo.svg" width="350" alt="accessibility text">
</p>
<div align="center">

  [Fireblocks Developer Portal](https://developers.fireblocks.com) </br>
  [Fireblocks Sandbox Sign-up](https://www.fireblocks.com/developer-sandbox-sign-up/) <br/><br/>
  <h1> Set 'Require Tag' configuration on your XRP account </h1>
</div>
<br/>


> :warning: **Warning:** 
> This code example utilizes the Fireblocks RAW signing feature. 
> 
> Raw Signing is an insecure signing method and is not generally recommended.  
> Bad actors can trick someone into signing a valid transaction message and use it to steal funds.
> 
> For this reason, Raw Signing is a premium feature that requires an additional purchase and is not available in production workspaces by default. 
> If you're interested in this feature and want to see if your use case is eligible for it, please contact your Customer Success Manager.
> 
> [Fireblocks Sandbox](https://developers.fireblocks.com/docs/sandbox-quickstart)  workspaces have Raw Signing enabled by default to allow for testing purposes.
<br/>
<hr/>


## ✅ Set 'Require Tag' configuration:

Clone the repo:
``` 
git clone <repo_link>
cd xrp_set_dest_tag
```

Install:

```bash
npm install -g typescript
npm install
```

Create `.env` file and set:
- `FIREBLOCKS_API_KEY` - your API Key
- `FIREBLOCKS_SECRET_KEY_PATH` - path to your API secret key
- `VAULT_ACCOUNT_ID` - the ID of the vault account to execute the RAW signing request from

Example:
```bash
FIREBLOCKS_API_KEY="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
FIREBLOCKS_SECRET_KEY_PATH="/path/to/secret_key/file.key"
VAULT_ACCOUNT_ID=1 
```

Runnig the script:

```bash
ts-node setDestTag.ts
```

Sign the RAW signing operation in your Fireblocks Mobile app.
Make sure that you have the following result printed out to the console:

```bash
resultCode: 'tesSUCCESS',
resultMessage: 'The transaction was applied. Only final in a validated ledger.'
.
.
.
https://xrpscan.com/tx/<tx_id>
```
Check the transaction's hash in the XRP block explorer and make sure that the transaction was executed successfully.

## ❌ For disabling 'Require Tag':
If you want to disable an already enabled 'Require Tag' configuration on your account, please update the `transaction` object in the `setDestTag.ts` file as following:

```js
 const transaction: TransactionJSON = {
    "TransactionType": "AccountSet",
    "Account": account,
    "Fee": "1000",
    "Domain": domain,
    // "SetFlag": 1 // --> Enable dest tag required 
    "ClearFlag": 1 // --> Disable test tag required (remove SetFlag in this case)
  }
```

While `SetFlag: 1` enables 'Require Tag' option on your account, `ClearFlag: 1` disables it.

---

## 📌 NOTE:
Since XRP transactions require `lastLedgerSequence` as a part of the transaction's body, when using RAW signing it is limited for a quite short period of time (up to 2 mins), which means that the transcation should be signed immediately after the submission. Waiting for longer signing time will result in unsuccessful transaction's broadcasting.
