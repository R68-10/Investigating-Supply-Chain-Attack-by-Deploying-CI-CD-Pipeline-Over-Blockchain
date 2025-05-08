
require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    const rpcUrl = process.env.BESU_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    const abiPath = path.join(__dirname, "SupplyChain.json");
    let abi;

    try {
      const contractJson = JSON.parse(fs.readFileSync(abiPath));
      abi = contractJson.abi;
      console.log(`Successfully loaded ABI from SupplyChain.json with ${abi.length} entries`);
    } catch (err) {
      console.error("❌ Error loading ABI from SupplyChain.json:", err);
      throw err;
    }

    this.chainId = parseInt(process.env.CHAIN_ID || "1337");
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);

    this.giteaToken = process.env.GITEA_TOKEN;
    this.jenkinsToken = process.env.JENKINS_TOKEN;
    this.defaultGasLimit = parseInt(process.env.TX_GAS_LIMIT || "100000");
  }

  async logPush(developerId, commitHash, changes) {
    return await this.contract.logPush(
      this.giteaToken,
      developerId,
      commitHash,
      changes,
      {
        gasLimit: this.defaultGasLimit
      }
    );
  }

  async logBuild(jobId, status) {
    return await this.contract.logBuild(
      this.jenkinsToken,
      jobId,
      status,
      {
        gasLimit: this.defaultGasLimit
      }
    );
  }

  async logTest(jobId, status) {
    return await this.contract.logTest(
      this.jenkinsToken,
      jobId,
      status,
      {
        gasLimit: this.defaultGasLimit
      }
    );
  }

  async logDeploy(jobId, status) {
    return await this.contract.logDeploy(
      this.jenkinsToken,
      jobId,
      status,
      {
        gasLimit: this.defaultGasLimit
      }
    );
  }
}

module.exports = BlockchainService;
