---
title: Getting Started as IdP
---

# Getting Started as IdP

## Node keys

If you've already followed the example in [Register other nodes](/getting-started/ndid.html#register-other-nodes) on _Getting Started as NDID_ page, skip this step.

Prepare 2 RSA key pairs, one for node key and another for node master key.

```sh
mkdir ./keys

# Generate node key pair
openssl genrsa -out ./keys/idp1.pem 2048
openssl rsa -in ./keys/idp1.pem -outform PEM -pubout -out ./keys/idp1_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/idp1_master.pem 2048
openssl rsa -in ./keys/idp1_master.pem -outform PEM -pubout -out ./keys/idp1_master_pub.pem
```

## Tendermint and ABCI app

Follow steps in [Setup](/getting-started/setup.html#setup-more-tendermint-nodes) if you haven't already.

Run Tendermint and ABCI app bundle

### Built from source

```sh
ABCI_DB_DIR_PATH=./idp1_abci_data ./did-tendermint \
--home ./idp1_tm_home \
--p2p.laddr=tcp://0.0.0.0:27656 \
--rpc.laddr=tcp://0.0.0.0:27657 \
node
```

### Docker

```sh
docker run \
-p 27656:26656 -p 27657:26657 \
--volume $PWD/idp1_tm_home:/tendermint \
--volume $PWD/idp1_abci_data:/DID \
--name idp1_tm_1 \
ndidplatform/did-tendermint
```

## MQ Service Server

Follow steps in [Setup](/getting-started/setup.html#api-server) if you haven't already.

### Built from source

```sh
cd ./api/mq-server

MQ_BINDING_PORT=5655 \
SERVER_PORT=51051 \
NODE_ID=idp1 \
node build/server.js
```

### Docker

```sh
docker run \
-p 51051:51051 \
-p 5655:5655 \
--env "MQ_BINDING_PORT=5655" \
--env "SERVER_PORT=51051" \
--env "NODE_ID=idp1" \
--name idp1_mq \
ndidplatform/mq
```

## API Server

Follow steps in [Setup](/getting-started/setup.html#api-server) if you haven't already.

Run Redis server

### Docker

```sh
docker run -p 6479:6379 --name idp1_redis redis:4-alpine
```

Run an API server

### Built from source

```sh
cd ./api/main-server

TENDERMINT_IP=127.0.0.1 \
TENDERMINT_PORT=27657 \
NODE_ID=idp1 \
PRIVATE_KEY_PATH=/path/to/keys/idp1.pem \
MASTER_PRIVATE_KEY_PATH=/path/to/keys/idp1_master.pem \
DB_PORT=6479 \
MQ_CONTACT_IP=127.0.0.1 \
MQ_BINDING_PORT=5655 \
MQ_SERVICE_SERVER_PORT=51051 \
SERVER_PORT=8180 \
node build/server.js
```

### Docker

```sh
docker run \
-p 8180:8180 \
--link idp1_tm_1:tendermint \
--link idp1_redis:redis \
--link idp1_mq:mq \
--volume $PWD/keys:/keys \
--env "TENDERMINT_IP=tendermint" \
--env "TENDERMINT_PORT=26657" \
--env "DB_IP=redis" \
--env "NODE_ID=idp1" \
--env "PRIVATE_KEY_PATH=/keys/idp1.pem" \
--env "MASTER_PRIVATE_KEY_PATH=/keys/idp1_master.pem" \
--env "MQ_CONTACT_IP=<YOUR_DOCKER_HOST_IP>" \
--env "MQ_SERVICE_SERVER_IP=mq" \
--env "MQ_BINDING_PORT=5655" \
--env "MQ_SERVICE_SERVER_PORT=51051" \
--env "SERVER_PORT=8180" \
--name idp1_api \
ndidplatform/api
```

## Set Callbacks

API for setting callback URLs is [POST `/idp/callback`](https://app.swaggerhub.com/apis/NDID/identity_provider/3.0#/default/set_callback_url){:target="\_blank" rel="noopener"}.

You need to set callback URL for receiving incoming requests from RP `incoming_request_url` otherwise the API main server will drop those requests. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/consent_request){:target="\_blank" rel="noopener"}.

You must set callback URL for API server to request for encrypt with user's accessor key `accessor_encrypt_url` when responding to mode 2 or 3 requests. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/request_for_accessor_to_encrypt){:target="\_blank" rel="noopener"}.

It is highly recommend to set callback URL for receiving identity modification notifications `identity_modification_notification_url` to notify to users onboarded with this IdP. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/post_idp_identity_notification){:target="\_blank" rel="noopener"}.

You may want to receive request status updates `incoming_request_status_update_url` to notify your users a request progress or update your local database. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/post_idp_request_status_update){:target="\_blank" rel="noopener"}.

If you want to receive callbacks reporting errors from a main API server, set an URL using property `error_url`. API specification for callback can be found [here](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/post_idp_error){:target="\_blank" rel="noopener"}.
