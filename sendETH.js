require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const toAddress = '0x35745dfd29d260536de72dc955451fbfa1bbbfda';

  const tx = {
    to: toAddress,
    value: ethers.parseEther('1.0'), // 1 ETH
  };

  const sentTx = await wallet.sendTransaction(tx);
  console.log(`Transaction sent: ${sentTx.hash}`);
  const receipt = await sentTx.wait();
  console.log('Transaction mined:', receipt.transactionHash);
}

main().catch(err => {
  console.error('Error:', err);
});
