---
id: guides-load-balancing
title: Load Balancing
---

Running a node (API main server) with load balancing config is preferable for nodes that have to process more than 15 requests/second. If you don't need the ability to process more than 15 requests/second, it is recommended to run a main server in standalone mode for less complicated setup and latency.

There needs to be a master process to manage jobs for workers because requests must be process only once to avoid unintentional errors. Therefore, there is a limit to how much you can scale out.

## Master process

There **MUST** be only 1 master process per node ID. This process handles messages and events, queue them, and distributes to worker processes. Master process does not have API HTTP server running.

To run API main server as a master process, set the following environment variables:

- `MODE=master`
- `MASTER_SERVER_PORT=<GRPC_PORT_FOR_WORKER_TO_CONNECT>`

**Example**

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
MODE=master \
MASTER_SERVER_PORT=7001 \
node build/server.js
```

or with Docker

```sh
docker run \
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
--env "MODE=master" \
--env "MASTER_SERVER_PORT=7001" \
--name idp1_api_master \
ndidplatform/api
```

## Worker process

There can be as many worker processes as you see appropriate. API HTTP server will be run on worker processes. Client app should distribute API calls to each worker evenly. You can use a reverse proxy such as Nginx to help distribute API calls.

To run API main server as a worker process, set the following environment variables:

- `MODE=worker`
- `MASTER_SERVER_IP=<MASTER_PROCESS_GRPC_IP>`
- `MASTER_SERVER_PORT=<MASTER_PROCESS_GRPC_PORT>`

**Example**

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
MODE=worker \
MASTER_SERVER_IP=127.0.0.1 \
MASTER_SERVER_PORT=7001 \
node build/server.js
```

or with Docker

```sh
docker run \
-p 8180:8180 \
--link idp1_tm_1:tendermint \
--link idp1_redis:redis \
--link idp1_mq:mq \
--link idp1_api_master:idp1_api_master \
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
--env "MODE=worker" \
--env "MASTER_SERVER_IP=idp1_api_master" \
--env "MASTER_SERVER_PORT=7001" \
--name idp1_api_worker_1 \
ndidplatform/api
```

## Caveat

- There needs to be at least 1 master process and 1 worker process running for a node to function.
- When shutting down server, worker processes should be stopped before master process to avoid dangling unfinished jobs.
- Master process and all worker processes **MUST** use the same redis server.
- There is a scaling limit nonetheless since master process is the only one that receives and distributes jobs to worker processes.
- 1 worker process can handle requests at approximately 15 requests/second.
