---
title: Example authentication flow
---

# Example Authentication Flow

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to explain the PoC for authentication scenario outlined in [Technical overview](/technical-overview) for better understanding for further implementation. This document is **not** the definitive source of information, also the PoC mention here is **may or may not** use in production system.

</div>

## PoC repository explanation

- [smart-contract](https://github.com/ndidplatform/smart-contract)
  is a repository for implementation of NDID platform at blockchain level.
  This contains tendermint and golang implementation responsible 
  for storing/querying data to/from blockchain. Basically, it is a tendermint ABCI app.

- [api](https://github.com/ndidplatform/api)
  is a repository for implementation of NDID platform at API level.
  This contains nodejs implementation responsible for communicating with cllient application
  via HTTP API and platform logic such as encryption/decryption and message queue.
  - src/routes HTTP API
  - src/main main logic
  - src/mq message queue interface

- [examples](https://github.com/ndidplatform/examples)
  is **not** a part of the platform but examples of client application to 
  help developers understand how to communicate with the platform and handle callback.

## Before we start

To run the authentication flow, there is an issue we must discuss, the onboarding process.
To visualize the flow, RP,IDP,AS must register themselves (and their customers, for IDP) to the system.
This is not a part of the flow but has to be done. 
In production, all parties need to contact NDID to add their public key to the system.
In development, run `NODE_ID=ndid1 npm run initDevKey` after the platform is ready to add their pre-generated keys to the system.
For register customer (user onboarding) you have to run it yourself which we discuss how to do this in this page.

## To run the example flow

Clone `smart-contract` and `api` to your machine. (client-app-example is optional)
We recommend cloning `smart-contract` to `$GOPATH/src/github.com/ndidplatform/`.

There are two ways to run the stack, using docker compose file and running each part of the platform manually. We recommend using docker compose as it is less complicated.

- Docker compose

Go `docker` directory in `smart-contract` project directory or `$GOPATH/src/github.com/ndidplatform/smart-contract/docker`.

Run the following command `docker-compose up`. This will run 3 tendermint-ABCI containers with 1 validator.

Then go to `docker` directory in `api` project directory.

Run the following command `docker-compose up`. This will run 1 NDID node, 1 RP node, 2 IdP nodes, 1 AS node along with their message queue service and redis processes. For a setup with more role nodes (1 NDID node, 1 RP node, 3 IdP nodes, 2 AS nodes, and 2 Proxy nodes) (e.g. for running end-to-end test suite found in `ndidplatform/test` repository), use `docker-compose.test.yml` file by running `docker-compose -f docker-compose.test.yml up` instead.

- Manually

Follow the setup and start steps in each repository.
If you want to run all repository on **the same machine without VM**, you can use these scripts to start the flow.

At `$GOPATH/src/github.com/ndidplatform/smart-contract`

- idp-abci
  ```
  go run ./abci --home ./config/tendermint/IdP unsafe_reset_all && \
  CGO_ENABLED=1 CGO_LDFLAGS="-lsnappy" ABCI_DB_DIR_PATH=IdP_DB go run -tags "gcc" ./abci --home ./config/tendermint/IdP node
  ```
- rp-abci
  ```
  go run ./abci --home ./config/tendermint/RP unsafe_reset_all && \
  CGO_ENABLED=1 CGO_LDFLAGS="-lsnappy" ABCI_DB_DIR_PATH=RP_DB go run -tags "gcc" ./abci --home ./config/tendermint/RP node
  ```

Go to `api` project directory and then run `NODE_ID=ndid1 npm run initDevKey`, wait for it to finish, then start it by running the following commands

- idp-api
  ```
  MQ_CONTACT_IP=127.0.0.1 \
  MQ_BINDING_PORT=5555 \
  MQ_SERVICE_SERVER_PORT=50051 \
  SERVER_PORT=8100 \
  NODE_ID=idp1 \
  npm start
  ```

- rp-api
  ```
  MQ_CONTACT_IP=127.0.0.1 \
  MQ_BINDING_PORT=5565 \
  MQ_SERVICE_SERVER_PORT=50061 \
  SERVER_PORT=8200 \
  NODE_ID=rp1 \
  npm start
  ```

Run MQ service

- idp-api
  ```
  MQ_BINDING_PORT=5555 \
  SERVER_PORT=50051 \
  NODE_ID=idp1 \
  node build/server.js
  ```
- rp-api
  ```
  MQ_BINDING_PORT=5565 \
  SERVER_PORT=50061 \
  NODE_ID=rp1 \
  node build/server.js
  ```

Run a Redis server

After all necessary processes, you can start the flow. You can test with our provided `examples` or with `HTTP` tool of your choice e.g. `Postman`.

## Test the flow with our examples

Go to our `examples` repositories.

- Docker compose

Go `docker` directory in `examples` project directory.

Run `docker-compose up`

- Manually

If you run the examples in the same machine, you can use these scripts.

- idp-client-app
  ```
  API_SERVER_ADDRESS=http://localhost:8080 \
  NDID_API_CALLBACK_IP=localhost \
  NDID_API_CALLBACK_PORT=5000 \
  SERVER_PORT=8000 \
  npm start
  ```

- rp-client-app
  ```
  API_SERVER_ADDRESS=http://localhost:8081 \
  NDID_API_CALLBACK_IP=localhost \
  NDID_API_CALLBACK_PORT=5001 \
  SERVER_PORT=8001 \
  npm start
  ```

`idp-client-app` will register callback a url according to `NDID_API_CALLBACK_IP` and `NDID_API_CALLBACK_PORT` set on start.
`rp-client-app` will set `callback_url` (parameter when create new request) 
according to `NDID_API_CALLBACK_IP` and `NDID_API_CALLBACK_PORT` set on start.

Before you can test, you will need to visit `http://localhost:8080/identity` to register user associate with IDP.
To test the flow, open a web browser and navigate to `http://localhost:8080/__namespace__/__identifier__` for IDP and `http://localhost:8081` for RP.
When you press `Request Identity Verification` button at RP with `namespace` and `identifier` that IDP recognizes,
IDP will be notified and display options for accepting or rejecting a request.
When you choose to either accepting or rejecting at IDP, RP will display the result accordingly.

Note: To remove all registered users at IDP (`idp-client-app`), delete `persistent_db` directory.

## Test the flow with POSTMAN (under maintenance)

<del>You can download [POSTMAN collection](/assets/authen-flow-postman.json) and import to POSTMAN.

<del>at tab `http://localhost:8080/identity` you specify what user the IDP will assiciate to, and IDP will only receive request from its associated user.

<del>At tab `http://localhost:8081/rp/requests/cid/1234567890123` in POSTMAN is use to create request, note that we hard-coded IDP to be responsible for only authentication request for namespace `cid` and identifier `1234567890123`. If you want IDP to be responsible for other namespaces and identifiers, edit `users.json` and restart `idp-api`.

<del>After creating a request you can see at `idp-api` that IDP receive message via message queue.
Now you can use POSTMAN tab `http://localhost:8081/rp/requests/...` and replace ... with `request_id` you get from former step to see request status in blockchain.

<del>At tab `http://localhost:8080/idp/response`, replace `request_id` in body with above id and you will see at `rp-api` that the platform will try to callback to RP via `callback_url` we send in `/rp/request/`. Which may result in error if you do not have any HTTP server listening to that url.
