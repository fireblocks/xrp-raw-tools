<p align="center">
  <img src="./logo.svg" width="350" alt="accessibility text">
</p>
<div align="center">

  [Fireblocks Developer Portal](https://developers.fireblocks.com) </br>
  [Fireblocks Sandbox Sign-up](https://www.fireblocks.com/developer-sandbox-sign-up/) <br/><br/>
  <h1> Set 'Require Tag' configuration on your XRP account </h1>
</div>
<br/>


> :warning: **Warning:** This code example utilizes the Fireblocks RAW signing capability, which is an advanced feature not typically enabled in production environments. To access RAW signing, contact your Customer Success Manager to determine if it aligns with your specific needs. It's important to note that RAW signing carries unique security risks. Misuse or deviation from Fireblocks' recommended best practices may lead to security breaches. Clients employing RAW signing must be fully aware of these risks and acknowledge that Fireblocks cannot be held liable for any financial losses resulting from the use of RAW signing.

<br/>
<hr/>


## Set 'Require Tag' configuration:

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

Edit the setDestTag.ts file:

```bash
API_KEY - your API Key
PATH_TO_SECRET_KEY - the path to your RSA private key (for example: '~/secrets/fireblocks_secret.key')
VAULT_ACCOUNT_ID - the vault account ID of the XRP wallet to set the require tag configuration
```

Run:

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

## For disabling 'Require Tag':
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

## Please NOTE:
Since XRP transactions require `lastLedgerSequence` as a part of the transaction's body, when using RAW signing it is limited for a quite short period of time (up to 2 mins), which means that the transcation should be signed immediately after the submission. Waiting for longer signing time will result in unsuccessful transaction's broadcasting.
