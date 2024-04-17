import { FireblocksSDK, PeerType, TransactionOperation, TransactionStatus } from "fireblocks-sdk";
import * as xrp_utils from './xrp_utils'
// import * as ripple from 'ripple-lib';
import { RippleAPI } from "ripple-lib";
import * as binaryCodec from 'ripple-binary-codec';

let ASSET_ID: string = "";
export function setAssetId(assetId: string) {ASSET_ID = assetId;};

let BLOCK_EXPLORER: string = "";
export function setBlockExplorer(blockexplorerURL: string) {BLOCK_EXPLORER = blockexplorerURL;};

export async function signRippleTransaction(
  fireblocksApiClient: FireblocksSDK,
  vaultAccountId: number,
  txJSON: string,
  note: string
): Promise<{ signedTransaction: string; id: string }> {
  
  console.log(JSON.stringify(txJSON));  
  const tx = JSON.parse(txJSON);

  if (tx.TxnSignature || tx.Signers) {
    throw new Error(
      'txJSON must not contain "TxnSignature" or "Signers" properties'
    )
  }

  const txToSignAndEncode = Object.assign({}, tx);

  const { publicKey } = await fireblocksApiClient.getPublicKeyInfoForVaultAccount({
    vaultAccountId,
    assetId: ASSET_ID,
    change: 0,
    addressIndex: 0,
    compressed: true
  });

  txToSignAndEncode.SigningPubKey = publicKey;
  const signingData = binaryCodec.encode(txToSignAndEncode);
  const content = RippleAPI.computeBinaryTransactionSigningHash(signingData);

  // sign with Fireblocks RAW signing
  const { id, status } = await fireblocksApiClient.createTransaction({
    operation: TransactionOperation.RAW,
    assetId: ASSET_ID,
    source: {
      type: PeerType.VAULT_ACCOUNT,
      id: vaultAccountId.toString()
    },
    note,
    extraParameters: {
      rawMessageData: {
        messages: [
          {
            content
          }
        ]
      }
    }
  });

  let txInfo;
  let currentStatus = status;

  while (currentStatus != TransactionStatus.COMPLETED && currentStatus != TransactionStatus.FAILED && currentStatus != TransactionStatus.CANCELLED) {
    try {
      console.log("keep polling for tx " + id + "; status: " + currentStatus);
      txInfo = await fireblocksApiClient.getTransactionById(id);
      currentStatus = txInfo.status;
    } catch (err) {
      console.log(err);
    }
    await new Promise(r => setTimeout(r, 3000));
  };

  if (currentStatus == TransactionStatus.FAILED) {
    throw "Transaction failed";
  }

  //raw transaction signed
  const sig = txInfo.signedMessages[0].signature;
  const derSig = Buffer.from(
    xrp_utils.toDER(
      [...Buffer.from(sig.r, "hex")],
      [...Buffer.from(sig.s, "hex")])
  ).toString("hex");

  txToSignAndEncode.TxnSignature = derSig;
  const serialized = binaryCodec.encode(txToSignAndEncode)

  xrp_utils.checkTxSerialization(serialized, tx)

  return {
    signedTransaction: serialized,
    id: RippleAPI.computeBinaryTransactionHash(serialized)
  }
};

export async function signAndSubmitTransaction(
  rippleApi,
  fireblocksApiClient: FireblocksSDK,
  vaultAccountId: number,
  transaction: object,
  note: string) {
    let tx = await rippleApi.prepareTransaction(transaction);
    let jsonTx = JSON.parse(tx.txJSON);
    jsonTx.LastLedgerSequence += 20;
    let jsonToSign = JSON.stringify(jsonTx);

    const { signedTransaction, id } = await signRippleTransaction(
      fireblocksApiClient,
      vaultAccountId,
      jsonToSign,
      note
    );

    console.log("Transaction ID", id);
    console.log("signed transaction", signedTransaction)

    const result = await rippleApi.submit(signedTransaction).catch(err => {
      console.log(err);
    }
  )

  console.log("Result:", result)
  await new Promise(r => setTimeout(r, 3000));
  console.log(BLOCK_EXPLORER + `/${result.tx_json.hash}`)
};


export async function getAddress(fireblocksApiClient: FireblocksSDK, vaultAccountId: any) {
  return (
    await fireblocksApiClient.getDepositAddresses(
      vaultAccountId.toString(), 
      ASSET_ID
    )
  )[0].address;
}
