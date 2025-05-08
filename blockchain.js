require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    const rpcUrl = process.env.BESU_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    const abiPath = path.join(__dirname, "SupplyChain.json"); // <-- updated path
    let abi;

    try {
      const contractJson = JSON.parse(fs.readFileSync(abiPath));
      abi = contractJson.abi;
      console.log(`Successfully loaded ABI from SupplyChain.json with ${abi.length} entries`);
    } catch (err) {
      console.error("❌ Error loading ABI from SupplyChain.json:", err);
      throw err;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);

    this.giteaToken = process.env.GITEA_TOKEN;
    this.jenkinsToken = process.env.JENKINS_TOKEN;

    console.log(`Blockchain service initialized with contract at ${contractAddress}`);
    console.log(`Using Besu RPC URL: ${rpcUrl}`);
    console.log(`Using Contract Address: ${contractAddress}`);
    console.log(`Using GITEA_TOKEN: ${this.giteaToken}`);
    console.log(`Using JENKINS_TOKEN: ${this.jenkinsToken}`);
  }

  async logPush(developer, commitHash, message) {
    try {
      const tx = await this.contract.logPush(
        this.giteaToken,
        developer,
        commitHash,
        message
      );
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err) {
      console.error("Error logging push event:", err);
      throw err;
    }
  }

  async logBuild(jobID, status) {
    try {
      const tx = await this.contract.logBuild(
        this.jenkinsToken,
        jobID,
        status
      );
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err) {
      console.error("Error logging build event:", err);
      throw err;
    }
  }

  async logTest(jobID, status) {
    try {
      const tx = await this.contract.logTest(
        this.jenkinsToken,
        jobID,
        status
      );
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err) {
      console.error("Error logging test event:", err);
      throw err;
    }
  }

  async logDeploy(jobID, status) {
    try {
      const tx = await this.contract.logDeploy(
        this.jenkinsToken,
        jobID,
        status
      );
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err) {
      console.error("Error logging deploy event:", err);
      throw err;
    }
  }

  async checkConnection() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber >= 0;
    } catch {
      return false;
    }
  }
}

module.exports = BlockchainService;

