---
title: Technical overview
---

# Example Authentication Flow

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to explain the PoC for authentication scenario outlined in [Technical overview](/technical-overview) for better understanding for further implementation. This document is **not** the definitive source of information, also the PoC mention here is **may or may not** use in production system.

</div>

## PoC repository explanation

- [ndid-smart-contract](https://github.com/ndidplatform/ndid-smart-contract)
  is a repository for implementation of NDID platform at blockchain level.
  This contains tendermint and golang implementation responsible 
  for storing/querying data to/from blockchain. Basically, it is an tendermint ABCI app.

- [ndid-api](https://github.com/ndidplatform/ndid-api)
  is a repository for implementation of NDID platform at API level.
  This contains nodejs implementation responsible for communicating with cllient application
  via HTTP API and platform logic such as encryption/decryption and message queue.
  - src/routes HTTP API
  - src/main main logic
  - src/mq message queue interface

- [ndid-client-app-idp-example](https://github.com/ndidplatform/ndid-client-app-idp-example)
  and [ndid-client-app-rp-example](https://github.com/ndidplatform/ndid-client-app-rp-example)
  is **not** a part of the platform but examples of client application to 
  help developers understand how to communicate with the platform and handle callback.

## Before we start

To run the authentication flow, there is an issue we must discuss, the onboarding process.
To visualize the flow, IDP must register themselves and their customers to the system.
This is not a part of the flow but has to be done. `ndid-api` automatically do this when start. 

## To run the example flow

Clone `ndid-smart-contract` and `ndid-api` to your machine. (client-app-example is optional)
We recommend cloning `ndid-smart-contract` to `$GOPATH/src/github.com/digital-id/`.

Follow the setup and start steps in each repository.
If you want to run all repository on **the same machine without VM**, you can use these scripts to start the flow (6 terminals).

At `$GOPATH/src/github.com/digital-id/ndid-smart-contract`

- idp-abci
  ```
  CALLBACK_URI=http://localhost:3000/callback go run abci/server.go tcp://127.0.0.1:46000
  ```
- idp-tendermint
  ```
  tendermint --home ./config/tendermint/IdP unsafe_reset_all && \
  tendermint --home ./config/tendermint/IdP node --consensus.create_empty_blocks=false
  ```
- rp-abci
  ```
  CALLBACK_URI=http://localhost:3001/callback go run abci/server.go tcp://127.0.0.1:46001
  ```
- rp-tendermint
  ```
  tendermint --home ./config/tendermint/RP unsafe_reset_all && \
  tendermint --home ./config/tendermint/RP node --consensus.create_empty_blocks=false
  ```

Wait for **both** `idp-abci` and `rp-abci` to display
```
Commit
Commit
```
before proceeding to `ndid-api` directory

- idp-api
  ```
  ROLE=idp \
  MQ_CONTACT_IP=127.0.0.1 \
  MQ_BINDING_PORT=5555 \
  ASSOC_USERS=users.json \
  ABCI_APP_CALLBACK_PORT=3000 \
  SERVER_PORT=8080 \
  npm start
  ```

- rp-api
  ```
  ROLE=rp \
  ABCI_APP_CALLBACK_PORT=3001 \
  SERVER_PORT=8081 \
  npm start
  ```

After starting `ndid-api`, wait for `Commit` to display in `idp-abci` and `rp-abci`,
then you can start the flow.

## Test the flow with POSTMAN

You can download [POSTMAN collection](/assets/authen-flow-postman.json) and import to POSTMAN.

At tab `http://localhost:8081/rp/requests/cid/1234567890123` in POSTMAN is use to create request, note that we hard-coded IDP to be responsible for only authentication request for namespace `cid` and identifier `1234567890123`. If you want IDP to be responsible for other namespaces and identifiers, edit `users.json` and restart `idp-api`.

After creating a request you can see at `idp-api` that IDP receive message via message queue.
Now you can use POSTMAN tab `http://localhost:8081/rp/requests/...` and replace ... with `request_id` you get from former step to see request status in blockchain.

At tab `http://localhost:8080/idp/response`, replace `request_id` in body with above id and you will see at `rp-api` that the platform will try to callback to RP via `callback_url` we send in `/rp/request/`. Which may result in error if you do not have any HTTP server listening to that url.

## Test the flow with our client-example

You can also test the flow with our `client-example` repositories.
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
  NDID_API_CALLBACK_PORT=5001 \
  SERVER_PORT=8001 \
  npm start
  ```

For these repositories, `idp-client-app` will register callback url according to `NDID_API_CALLBACK_IP` and `NDID_API_CALLBACK_PORT` on start.
And `rp-client-app` is hard-coded to create a request for namespace `cid` and identifier `1234567890123`, and will send `callback_url` according to `NDID_API_CALLBACK_PORT`.

To test the flow, open a web browser and navigate to `http://localhost:8080` for IDP and `http://localhost:8081` for RP.
When you press `verify identity` button at RP, IDP will be notified and display options for accepting or rejecting a request.
When you choose to either accepting or rejecting at IDP, RP will display the result accordingly.
