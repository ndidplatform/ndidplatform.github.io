---
title: Example authentication flow
---

# Example Authentication Flow

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to explain the PoC for authentication scenario outlined in [Technical overview](/technical-overview) for better understanding for further implementation. This document is **not** the definitive source of information, also the PoC mention here is **may or may not** use in production system.

</div>

## PoC repository explanation

- [ndid-smart-contract](https://github.com/ndidplatform/ndid-smart-contract)
  is a repository for implementation of NDID platform at blockchain level.
  This contains tendermint and golang implementation responsible 
  for storing/querying data to/from blockchain. Basically, it is a tendermint ABCI app.

- [ndid-api](https://github.com/ndidplatform/ndid-api)
  is a repository for implementation of NDID platform at API level.
  This contains nodejs implementation responsible for communicating with cllient application
  via HTTP API and platform logic such as encryption/decryption and message queue.
  - src/routes HTTP API
  - src/main main logic
  - src/mq message queue interface

- [ndid-example](https://github.com/ndidplatform/examples)
  is **not** a part of the platform but examples of client application to 
  help developers understand how to communicate with the platform and handle callback.

## Before we start

To run the authentication flow, there is an issue we must discuss, the onboarding process.
To visualize the flow, RP,IDP,AS must register themselves (and their customers, for IDP) to the system.
This is not a part of the flow but has to be done. 
In production, all parties need to contact NDID to add their public key to the system.
In development, please run `npm run initDevKey` to add their pre-generated keys to the system.
For register customer (user onboarding) you have to run it yourself which we discuss how to do this in this page.

## To run the example flow

Clone `ndid-smart-contract` and `ndid-api` to your machine. (client-app-example is optional)
We recommend cloning `ndid-smart-contract` to `$GOPATH/src/github.com/digital-id/`.

Follow the setup and start steps in each repository.
If you want to run all repository on **the same machine without VM**, you can use these scripts to start the flow (6 terminals).

At `$GOPATH/src/github.com/digital-id/ndid-smart-contract`

- idp-abci
  ```
  go run abci/server.go tcp://127.0.0.1:46000
  ```
- idp-tendermint
  ```
  tendermint --home ./config/tendermint/IdP unsafe_reset_all && \
  tendermint --home ./config/tendermint/IdP node --consensus.create_empty_blocks=false
  ```
- rp-abci
  ```
  go run abci/server.go tcp://127.0.0.1:46001
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
  SERVER_PORT=8080 \
  npm start
  ```

- rp-api
  ```
  ROLE=rp \
  MQ_CONTACT_IP=127.0.0.1 \
  MQ_BINDING_PORT=5556 \
  SERVER_PORT=8081 \
  npm start
  ```

After starting `ndid-api`, wait for `Commit` to display in `idp-abci` and `rp-abci`,
then you can start the flow.

## Test the flow with POSTMAN

You can download [POSTMAN collection](/assets/authen-flow-postman.json) and import to POSTMAN.

at tab `http://localhost:8080/identity` you specify what user the IDP will assiciate to, and IDP will only receive request from its associated user.

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
When you press `verify identity` button at RP with `namespace` and `identifier` that IDP recognize,
IDP will be notified and display options for accepting or rejecting a request.
When you choose to either accepting or rejecting at IDP, RP will display the result accordingly.

Note: to remove all register users for IDP, remove `db.json`.
