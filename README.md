Repository Structure & Branch Descriptions

This repository contains all components required for our capstone project:
Investigating Supply Chain Attack by Deploying CI/CD Pipeline Over Blockchain

Each branch is isolated to manage a specific module of the system.

🔹 main (Default Branch)
This branch holds the general structure of the project and serves as the entry point. It does not contain all code directly — instead, each module is organized into its own branch.

🔹 API-Server
Contains the Node.js webhook server that listens to events from:
    Gitea (push events)
    Jenkins (build/test/deploy status)
It uses ethers.js to send transactions to the smart contract deployed on the blockchain.

🔹 BlockScout
Holds the setup and configuration for running Blockscout as a blockchain explorer.
This branch depends on 3 internal directories:
    envs: Environment variable files for all services (e.g., database, Blockscout)
    proxy: Reverse proxy setup (likely Nginx or Traefik) to route traffic
    services: Docker Compose and related config for Blockscout backend/frontend/database
    These directories are part of Blockscout and should be kept together.

🔹 Hyperledger-Besu-Blockchain
Includes the setup for the private Ethereum-compatible blockchain using Hyperledger Besu.
This contains:
    Genesis configuration
    Node setup
    QBFT consensus setup
    Dockerized Besu deployment

🔹 Jenkins
Holds Jenkins pipeline configuration, possibly including:
    Declarative pipeline files (Jenkinsfile)
    Webhook setup for connecting with API server
    Job definitions and container configs

🔹 envs
Environment configuration files (.env) used across different services.
Includes RPC URLs, private keys, database URLs, and token secrets.

🔹 proxy
Contains reverse proxy configurations used to expose services like:
    Blockscout frontend/backend
    Jenkins
    API server

🔹 services
Contains dockerized microservice definitions, especially for:
    Blockscout
    PostgreSQL (for explorer DB)
    Redis
    Other dependency containers
