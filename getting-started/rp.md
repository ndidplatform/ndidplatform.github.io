---
title: Getting Started as RP
---

# Getting Started as RP

## Node keys

Prepare 2 RSA key pairs, one for node key and another for node master key.

If you've already followed the example in (Register other nodes)[http://localhost:4000/getting-started/ndid.html#register-other-nodes] on _Getting Started as NDID_ page, skip this step.

```sh
mkdir ./keys

# Generate node key pair
openssl genrsa -out ./keys/rp1.pem 2048
openssl rsa -in ./keys/rp1.pem -outform PEM -pubout -out ./keys/rp1_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/rp1_master.pem 2048
openssl rsa -in ./keys/rp1_master.pem -outform PEM -pubout -out ./keys/rp1_master_pub.pem
```

## Tendermint and ABCI app

Follow steps in [Setup](/getting-started/setup.html#setup-more-tendermint-nodes) if you haven't already.

Run Tendermint and ABCI app bundle

### Built from source

```sh
ABCI_DB_DIR_PATH=./rp1_abci_data ./did-tendermint \
--home ./rp1_tm_home \
--p2p.laddr=tcp://0.0.0.0:27656 \
--rpc.laddr=tcp://0.0.0.0:27657 \
node
```

### Docker

```sh
docker run \
-p 27656:26656 -p 27657:26657 \
--volume $PWD/rp1_tm_home:/tendermint \
--volume $PWD/rp1_abci_data:/DID \
--name rp1_tm_1 \
ndidplatform/did-tendermint
```

## API Server

Follow steps in [Setup](/getting-started/setup.html#api-server) if you haven't already.

Run Redis server

### Docker

```sh
docker run -p 6479:6379 --name rp1_redis redis:4-alpine
```

Run an API server

### Built from source

```sh
cd ./api/main-server

TENDERMINT_IP=127.0.0.1 \
TENDERMINT_PORT=27657 \
NODE_ID=rp1 \
PRIVATE_KEY_PATH=/path/to/keys/rp1.pem \
MASTER_PRIVATE_KEY_PATH=/path/to/keys/rp1_master.pem \
DB_PORT=6479 \
SERVER_PORT=8180 \
node build/server.js
```

### Docker

```sh
docker run \
-p 8180:8180 \
--link rp1_tm_1:tendermint \
--link rp1_redis:redis \
--volume $PWD/keys:/keys \
--env "TENDERMINT_IP=tendermint" \
--env "TENDERMINT_PORT=26657" \
--env "DB_IP=redis" \
--env "NODE_ID=rp1" \
--env "PRIVATE_KEY_PATH=/keys/ndid.pem" \
--env "MASTER_PRIVATE_KEY_PATH=/keys/ndid_master.pem" \
--env "SERVER_PORT=8180" \
--name rp1_api \
ndidplatform/api
```
