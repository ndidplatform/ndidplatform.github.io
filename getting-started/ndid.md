---
title: Getting Started as NDID
---

# Getting Started as NDID

## Node keys

Prepare 2 RSA key pairs, one for node key and another for node master key.

```sh
mkdir ./keys

# Generate node key pair
openssl genrsa -out ./keys/ndid.pem 2048
openssl rsa -in ./keys/ndid.pem -outform PEM -pubout -out ./keys/ndid_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/ndid_master.pem 2048
openssl rsa -in ./keys/ndid_master.pem -outform PEM -pubout -out ./keys/ndid_master_pub.pem
```

## Tendermint and ABCI app

Follow steps in [Setup](/getting-started/setup.html#tendermint-and-abci-app) if you haven't already.

Run Tendermint and ABCI app bundle

### Built from source

 ```sh
ABCI_DB_DIR_PATH=./ndid_abci_data ./did-tendermint --home ./ndid_tm_home node
```

### Docker

```sh
docker run \
-p 26656:26656 -p 26657:26657 \
--volume $PWD/ndid_tm_home:/tendermint \
--volume $PWD/ndid_abci_data:/DID \
--name ndid_tm_1 \
ndidplatform/did-tendermint
```

## API Server

Follow steps in [Setup](/getting-started/setup.html#api-server) if you haven't already.

Run Redis server

### Docker

```sh
docker run -p 6379:6379 --name ndid_redis redis:4-alpine
```

Run an API server

### Built from source

```sh
cd ./api/main-server

TENDERMINT_IP=127.0.0.1 \
TENDERMINT_PORT=26657 \
NODE_ID=ndid \
PRIVATE_KEY_PATH=/path/to/keys/ndid.pem \
MASTER_PRIVATE_KEY_PATH=/path/to/keys/ndid_master.pem \
SERVER_PORT=8080 \
NDID_NODE=true \
node build/server.js
```

### Docker

```sh
docker run \
-p 8080:8080 \
--link ndid_tm_1:tendermint \
--link ndid_redis:redis \
--volume $PWD/keys:/keys \
--env "TENDERMINT_IP=tendermint" \
--env "TENDERMINT_PORT=26657" \
--env "DB_IP=redis" \
--env "NODE_ID=ndid" \
--env "PRIVATE_KEY_PATH=/keys/ndid.pem" \
--env "MASTER_PRIVATE_KEY_PATH=/keys/ndid_master.pem" \
--env "SERVER_PORT=8080" \
--env "NDID_NODE=true" \
--name ndid_api \
ndidplatform/api
```

## Register NDID node

Make a HTTP call to POST `/ndid/init_ndid` with node public key and node master public key in JSON body.

```json
{
    "public_key": "<CONTENT_OF_ndid_pub.pem>",
    "master_public_key": "<CONTENT_OF_ndid_master_pub.pem>"
}
```

Example:

```sh
curl -skX POST http://127.0.0.1:8080/ndid/init_ndid \
    -H "Content-Type: application/json" \
    -d "{\"public_key\":\"$(cat ./keys/ndid_pub.pem)\",\"master_public_key\":\"$(cat ./keys/ndid_master_pub.pem)\"}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

After that, make a HTTP call to POST `/ndid/end_init` with empty body.

Example:

```sh
curl -skX POST http://127.0.0.1:8080/ndid/end_init \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

## Register other nodes

Nodes with RP, IDP, AS, or Proxy role can only be registered at NDID node.

Make a HTTP call POST `/ndid/init_ndid` with JSON body.

```json
{
    "node_key": "<CONTENT_OF_NODE_PUBLIC_KEY>",
    "node_master_key": "<CONTENT_OF_NODE_MASTER_PUBLIC_KEY>",
    "node_id": "<NODE_ID>",
    "node_name": "<NODE_NAME>",
    "role": "<ROLE>"
}
```

There are 2 additional required fields for IdP nodes.

```json
{
    "node_key": "<CONTENT_OF_NODE_PUBLIC_KEY>",
    "node_master_key": "<CONTENT_OF_NODE_MASTER_PUBLIC_KEY>",
    "node_id": "<NODE_ID>",
    "node_name": "<NODE_NAME>",
    "role": "<ROLE>",
    "max_ial": <MAX_IAL>,
    "max_aal": <MAX_AAL>
}
```

Example:

Register RP (rp1) node.

```sh
# Generate node key pair
openssl genrsa -out ./keys/rp1.pem 2048
openssl rsa -in ./keys/rp1.pem -outform PEM -pubout -out ./keys/rp1_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/rp1_master.pem 2048
openssl rsa -in ./keys/rp1_master.pem -outform PEM -pubout -out ./keys/rp1_master_pub.pem

# Register node
curl -skX POST http://127.0.0.1:8080/ndid/register_node \
    -H "Content-Type: application/json" \
    -d "{\"node_key\":\"$(cat ./keys/rp1_pub.pem)\",\"node_master_key\":\"$(cat ./keys/rp1_master_pub.pem)\",\"node_id\":\"rp1\",\"node_name\":\"RP 1 Node\",\"role\":\"rp\"}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

Register IdP (idp1) node.

```sh
# Generate node key pair
openssl genrsa -out ./keys/idp1.pem 2048
openssl rsa -in ./keys/idp1.pem -outform PEM -pubout -out ./keys/idp1_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/idp1_master.pem 2048
openssl rsa -in ./keys/idp1_master.pem -outform PEM -pubout -out ./keys/idp1_master_pub.pem

# Register node
curl -skX POST http://127.0.0.1:8080/ndid/register_node \
    -H "Content-Type: application/json" \
    -d "{\"node_key\":\"$(cat ./keys/idp1_pub.pem)\",\"node_master_key\":\"$(cat ./keys/idp1_master_pub.pem)\",\"node_id\":\"idp1\",\"node_name\":\"IdP 1 Node\",\"role\":\"idp\",\"max_ial\":3,\"max_aal\":3" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

Register AS (as1) node.

```sh
# Generate node key pair
openssl genrsa -out ./keys/as1.pem 2048
openssl rsa -in ./keys/as1.pem -outform PEM -pubout -out ./keys/as1_pub.pem

# Generate node master key pair
openssl genrsa -out ./keys/as1_master.pem 2048
openssl rsa -in ./keys/as1_master.pem -outform PEM -pubout -out ./keys/as1_master_pub.pem

# Register node
curl -skX POST http://127.0.0.1:8080/ndid/register_node \
    -H "Content-Type: application/json" \
    -d "{\"node_key\":\"$(cat ./keys/as1_pub.pem)\",\"node_master_key\":\"$(cat ./keys/as1_master_pub.pem)\",\"node_id\":\"as1\",\"node_name\":\"AS 1 Node\",\"role\":\"as\"}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

## Set node token

All nodes except NDID node have blockchain transaction quota to prevent spamming. Give nodes their tokens is required since new nodes will have 0 token and cannot make any transactions to the blockchain. Appropriate amount of tokens depends on NDID discretion.

Make a HTTP call POST `/ndid/set_node_token` with JSON body.

```json
{
    "node_id": "<NODE_ID>",
    "amount": <AMOUNT>,
}
```

Example:

```sh
# Give node "rp1" 10000 tokens
curl -skX POST http://127.0.0.1:8080/ndid/set_node_token \
    -H "Content-Type: application/json" \
    -d "{\"node_id\":\"rp1\",\"amount\":10000}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204

# Give node "idp1" 10000 tokens
curl -skX POST http://127.0.0.1:8080/ndid/set_node_token \
    -H "Content-Type: application/json" \
    -d "{\"node_id\":\"idp1\",\"amount\":10000}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204

# Give node "as1" 10000 tokens
curl -skX POST http://127.0.0.1:8080/ndid/set_node_token \
    -H "Content-Type: application/json" \
    -d "{\"node_id\":\"as1\",\"amount\":10000}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

## Create Namespaces

Create allowed namespace for SIDs on the platform by making HTTP call to POST `/ndid/create_namespace` with JSON body.

```json
{
    "namespace": "<NAMESPACE>",
    "description": "<NAMEPSACE_DESCRIPTION>"
}
```

IdPs can create identity or onboard user to the platform with created namespace only.

Example:

```sh
curl -skX POST http://127.0.0.1:8080/ndid/create_namespace \
    -H "Content-Type: application/json" \
    -d "{\"namespace\":\"citizen_id\",\"description\":\"Thai citizen ID\"}" \
    -w '%{http_code}' \
    -o /dev/null
# Output: 204
```

## Add Services

Create allowed service on the platform by making HTTP call to POST `/ndid/create_service` with JSON body.

```json
{
    "service_id": "<SERVICE_ID>",
    "service_name": "<SERVICE_NAME>"
}
```

Example:

```sh
curl -skX POST http://127.0.0.1:8080/ndid/create_service \
    -H "Content-Type: application/json" \
    -d "{\"service_id\":\"bank_statement\",\"service_name\":\"Bank statement\"}" \
    -w '%{http_code}' \
    -o /dev/null)
# Output: 204
```

## Approve Services

ASes can only register their provided services after NDID approves. NDID approves an AS service by making HTTP call to POST `/ndid/approve_service` with JSON body.

```json
{
    "service_id": "<SERVICE_ID>",
    "node_id": "<NODE_ID>"
}
```

Example:

```sh
# Approve/allow node "as1" to be able to register their service "bank_statement"
curl -skX POST http://127.0.0.1:8080/ndid/approve_service \
    -H "Content-Type: application/json" \
    -d "{\"service_id\":\"bank_statement\",\"node_id\":\"as1\"}" \
    -w '%{http_code}' \
    -o /dev/null)
# Output: 204
```
