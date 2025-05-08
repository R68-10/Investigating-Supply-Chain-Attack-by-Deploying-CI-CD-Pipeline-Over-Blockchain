// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const BlockchainService = require('./blockchain');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3002;
const BESU_RPC_URL = process.env.BESU_RPC_URL || 'http://172.17.0.2:8555';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x56FB6653a883C6368bD05e3BBD6d5e936BD81310';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x653610cd71a02459717e411ca046c8f1a761736583883957243ec58e8794dfdd';
const GITEA_TOKEN = process.env.GITEA_TOKEN || '0597615af91c6f3c0240e9e99f5359c11ac86a1d';
const JENKINS_TOKEN = process.env.JENKINS_TOKEN || '11acde552c042ccca316a6e120d86685fe';

const blockchainService = new BlockchainService({
  rpcUrl: BESU_RPC_URL,
  contractAddress: CONTRACT_ADDRESS,
  privateKey: PRIVATE_KEY,
  chainId: 1337
});

// Health check
app.get('/health', async (req, res) => {
  const connected = await blockchainService.checkConnection();
  res.status(200).json({
    status: 'up',
    blockchain: connected
  });
});

// Gitea webhook
app.post('/webhook/gitea', async (req, res) => {
  try {
    console.log('Received Gitea webhook:', JSON.stringify(req.body, null, 2));
    const payload = req.body;

    const developerID = payload.pusher?.login || 'unknown';
    const commitHash = payload.after || 'unknown';

    if (developerID === 'unknown' || commitHash === 'unknown') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing developer ID or commit hash in webhook payload.'
      });
    }

    let changes = 'code changes';
    if (payload.commits && payload.commits.length > 0) {
      const commit = payload.commits[0];

      const filesChanged = [
        ...(commit.modified || []),
        ...(commit.added || []),
        ...(commit.removed || [])
      ];

      const fileSummary = filesChanged.length > 0
        ? filesChanged.join(', ')
        : 'no file changes';

      changes = `${commit.message.trim()} | Files: ${fileSummary}`;
    }

    const result = await blockchainService.logPush(
      GITEA_TOKEN,
      developerID,
      commitHash,
      changes
    );

    res.status(200).json({
      status: 'success',
      message: 'Push event logged to blockchain',
      txHash: result.txHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    console.error('Error processing Gitea webhook:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Jenkins token middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token || token !== process.env.JENKINS_TOKEN_HASH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Jenkins webhook
app.post('/webhook/jenkins', authenticateToken, async (req, res) => {
  try {
    console.log('Received Jenkins webhook:', JSON.stringify(req.body, null, 2));

    const payload = req.body;
    const jobName = payload.name || 'unknown';
    const buildNumber = payload.build?.number?.toString() || '0';
    const status = payload.build?.status || 'unknown';
    const eventType = payload.eventType || 'build';

    let result;

    switch (eventType.toLowerCase()) {
      case 'build':
        result = await blockchainService.logBuild(
          process.env.JENKINS_TOKEN || 'jenkins-token',
          jobName,
          status
        );
        break;

      case 'test':
        result = await blockchainService.logTest(
          process.env.JENKINS_TOKEN || 'jenkins-token',
          jobName,
          status
        );
        break;

      case 'deploy':
        result = await blockchainService.logDeploy(
          process.env.JENKINS_TOKEN || 'jenkins-token',
          jobName,
          status
        );
        break;

      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    res.status(200).json({
      status: 'success',
      message: `${eventType} event logged to blockchain`,
      txHash: result.txHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    console.error('Error processing Jenkins webhook:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`APIServer listening on port ${PORT}`);
  console.log(`Gitea webhook URL: http://10.1.21.102:${PORT}/webhook/gitea`);
  console.log(`Jenkins webhook URL: http://10.1.21.102:${PORT}/webhook/jenkins`);
  console.log(`Health check URL: http://10.1.21.102:${PORT}/health`);
  console.log(`Using Besu RPC URL: ${BESU_RPC_URL}`);
  console.log(`Using Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`Using GITEA_TOKEN: ${GITEA_TOKEN}`);
  console.log(`Using JENKINS_TOKEN: ${JENKINS_TOKEN}`);
});

