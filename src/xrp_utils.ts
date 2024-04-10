import * as ripple from 'ripple-lib';
import * as binaryCodec from 'ripple-binary-codec';
import * as lodash from 'lodash';




export function checkTxSerialization(serialized: string, tx: ripple.TransactionJSON): void {
    // Decode the serialized transaction:
    const decoded = binaryCodec.decode(serialized)
  
    // ...And ensure it is equal to the original tx, except:
    // - It must have a TxnSignature or Signers (multisign).
    if (!decoded.TxnSignature && !decoded.Signers) {
      throw new Error(
        'Serialized transaction must have a TxnSignature or Signers property'
      )
    }
    // - We know that the original tx did not have TxnSignature, so we should delete it:
    delete decoded.TxnSignature
    // - We know that the original tx did not have Signers, so if it exists, we should delete it:
    delete decoded.Signers
  
    // - If SigningPubKey was not in the original tx, then we should delete it.
    //   But if it was in the original tx, then we should ensure that it has not been changed.
    if (!tx.SigningPubKey) {
      delete decoded.SigningPubKey
    }
    console.log(decoded)
    if (!lodash.isEqual(decoded, tx)) {
      const error = new Error(
        'Serialized transaction does not match original txJSON. See `error.data`'
      )
      throw error
    }
};
export function rmPadding(buf) {
    var i = 0;
    var len = buf.length - 1;
    while (!buf[i] && !(buf[i + 1] & 0x80) && i < len) {
      i++;
    }
    if (i === 0) {
      return buf;
    }
    return buf.slice(i);
};

export function constructLength(arr, len) {
    if (len < 0x80) {
      arr.push(len);
      return;
    }
    var octets = 1 + (Math.log(len) / Math.LN2 >>> 3);
    arr.push(octets | 0x80);
    while (--octets) {
      arr.push((len >>> (octets << 3)) & 0xff);
    }
    arr.push(len);
};

export function toDER(r, s) {
    // Pad values
    if (r[0] & 0x80)
      r = [ 0 ].concat(r);
    // Pad values
    if (s[0] & 0x80)
      s = [ 0 ].concat(s);
  
    r = rmPadding(r);
    s = rmPadding(s);
  
    while (!s[0] && !(s[1] & 0x80)) {
      s = s.slice(1);
    }
    var arr = [ 0x02 ];
    constructLength(arr, r.length);
    arr = arr.concat(r);
    arr.push(0x02);
    constructLength(arr, s.length);
    var backHalf = arr.concat(s);
    var res = [ 0x30 ];
    constructLength(res, backHalf.length);
    res = res.concat(backHalf);
    return res;
};

