---
title: Getting Started as AS
---

# Getting Started as AS

## Node keys

If you've already followed the example in [Register other nodes](/getting-started/ndid.html#register-other-nodes) on _Getting Started as NDID_ page, skip this step.

Prepare 2 RSA key pairs, one for node key and another for node master key.

```sh
mkdir ./keys

# Generate node key pair
openssl genrsa -out ./keys/as1.pem 2048
openssl rsa -in ./keys/as1.pem -outform PEM -pubout -out ./keys/as1_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/as1_master.pem 2048
openssl rsa -in ./keys/as1_master.pem -outform PEM -pubout -out ./keys/as1_master_pub.pem
```

## Tendermint and ABCI app

Follow steps in [Setup](/getting-started/setup.html#setup-more-tendermint-nodes) if you haven't already.

Run Tendermint and ABCI app bundle

### Built from source

```sh
ABCI_DB_DIR_PATH=./as1_abci_data ./did-tendermint \
--home ./as1_tm_home \
--p2p.laddr=tcp://0.0.0.0:28656 \
--rpc.laddr=tcp://0.0.0.0:28657 \
node
```

### Docker

```sh
docker run \
-p 27656:26656 -p 28657:26657 \
--volume $PWD/as1_tm_home:/tendermint \
--volume $PWD/as1_abci_data:/DID \
--name as1_tm_1 \
ndidplatform/did-tendermint
```

## MQ Service Server

Follow steps in [Setup](/getting-started/setup.html#api-server) if you haven't already.

### Built from source

```sh
cd ./api/mq-server

MQ_BINDING_PORT=5755 \
SERVER_PORT=52051 \
NODE_ID=as1 \
node build/server.js
```

### Docker

```sh
docker run \
-p 52051:52051 \
-p 5755:5755 \
--env "MQ_BINDING_PORT=5755" \
--env "SERVER_PORT=52051" \
--env "NODE_ID=as1" \
--name as1_mq \
ndidplatform/mq
```

## API Server

Follow steps in [Setup](/getting-started/setup.html#api-server) if you haven't already.

Run Redis server

### Docker

```sh
docker run -p 6579:6379 --name as1_redis redis:4-alpine
```

Run an API server

### Built from source

```sh
cd ./api/main-server

TENDERMINT_IP=127.0.0.1 \
TENDERMINT_PORT=28657 \
NODE_ID=as1 \
PRIVATE_KEY_PATH=/path/to/keys/as1.pem \
MASTER_PRIVATE_KEY_PATH=/path/to/keys/as1_master.pem \
DB_PORT=6579 \
MQ_CONTACT_IP=127.0.0.1 \
MQ_BINDING_PORT=5755 \
MQ_SERVICE_SERVER_PORT=52051 \
SERVER_PORT=8280 \
node build/server.js
```

### Docker

```sh
docker run \
-p 8280:8280 \
--link as1_tm_1:tendermint \
--link as1_redis:redis \
--link as1_mq:mq \
--volume $PWD/keys:/keys \
--env "TENDERMINT_IP=tendermint" \
--env "TENDERMINT_PORT=26657" \
--env "DB_IP=redis" \
--env "NODE_ID=as1" \
--env "PRIVATE_KEY_PATH=/keys/as1.pem" \
--env "MASTER_PRIVATE_KEY_PATH=/keys/as1_master.pem" \
--env "MQ_CONTACT_IP=<YOUR_DOCKER_HOST_IP>" \
--env "MQ_SERVICE_SERVER_IP=mq" \
--env "MQ_BINDING_PORT=5755" \
--env "MQ_SERVICE_SERVER_PORT=52051" \
--env "SERVER_PORT=8280" \
--name as1_api \
ndidplatform/api
```

## Register Services

Once NDID has approved your node to provide a service, you must register a service for RP to be able to make a data request and API main server to callback to by making HTTP call to [POST `/as/service/{service_id}`](https://app.swaggerhub.com/apis/NDID/authoritative_source_api/3.0#/default/register_service){:target="\_blank" rel="noopener"}. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/as_callback/3.0#/default/data_request){:target="\_blank" rel="noopener"}.

## Set Callbacks

API for setting callback URLs is [POST `/as/callback`](https://app.swaggerhub.com/apis/NDID/authoritative_source_api/3.0#/default/set_callback_url){:target="\_blank" rel="noopener"}.

You may want to receive request status updates `incoming_request_status_update_url` to notify your users a request progress or update your local database. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/as_callback/3.0#/default/post_as_request_status_update){:target="\_blank" rel="noopener"}.

If you want to receive callbacks reporting errors from a main API server, set an URL using property `error_url`. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/as_callback/3.0#/default/post_as_error){:target="\_blank" rel="noopener"}.
