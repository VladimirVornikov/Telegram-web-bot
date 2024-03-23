const {getHttpEndpoint } =  require("@orbs-network/ton-access");
const { mnemonicToWalletKey } = require("@ton/crypto");
const { TonClient, WalletContractV4, internal } = require("@ton/ton");
require('dotenv').config()

async function main() {
  // open wallet v4 (notice the correct wallet version here)
  const mnemonic = process.env.WORDS24
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const balance = await client.getBalance(wallet.address);
  console.log(balance);


  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  console.log("seqno:", seqno);

}
  // make sure wallet is deployed
//   if (!await client.isContractDeployed(wallet.address)) {
//     return console.log("wallet is not deployed");
//   }

//   // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
//   const walletContract = client.open(wallet);
//   const seqno = await walletContract.getSeqno();
//   await walletContract.sendTransfer({
//     secretKey: key.secretKey,
//     seqno: seqno,
//     messages: [
//       internal({
//         to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
//         value: "0.05", // 0.05 TON
//         body: "Hello", // optional comment
//         bounce: false,
//       })
//     ]
//   });

//   // wait until confirmed
//   let currentSeqno = seqno;
//   while (currentSeqno == seqno) {
//     console.log("waiting for transaction to confirm...");
//     await sleep(1500);
//     currentSeqno = await walletContract.getSeqno();
//   }
//   console.log("transaction confirmed!");
// }

main();

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }