---
id: examples-data-request-flow
title: Example Data Request Flow
---

> **Disclaimer:** The purpose of this page is to explain the PoC for data-request scenario outlined in [Technical overview](/technical-overview) for better understanding for further implementation. This document is **not** the definitive source of information, also the PoC mention here is **may or may not** use in production system.

## Before we start

Please read [Example authentication flow](/example-authen-flow.html) before read this document.

Similar to IdP's registration in authentication flow, `as-client-app` will automatically register itself and its service list to platform every time it start.
In production, however, it will only register once.

Also, for backward compatability, AS's tendermint node is not acting as validator.

## To run the example flow

You need to run those processes in authentication flow and run 3 more processes for AS role.

Again, if you want to run all processes on **the same machine without VM**, you can use these scripts to start addtional processes (3 terminals).

At `$GOPATH/src/github.com/ndidplatform/smart-contract`

- as-abci
  ```
  go run abci/server.go tcp://127.0.0.1:46002
  ```
- as-tendermint
  ```
  tendermint --home ./config/tendermint/AS unsafe_reset_all && \
  tendermint --home ./config/tendermint/AS node --consensus.create_empty_blocks=false
  ```

Wait for `as-abci` to display
```
BeginBlock: 1
EndBlock
Commit
```
before proceeding to `api` directory

- as-api
  ```
  ROLE=as \
  NODE_ID=as1 \
  MQ_CONTACT_IP=127.0.0.1 \
  MQ_BINDING_PORT=5557 \
  SERVER_PORT=8082 \
  AS_ID=AS1 \
  npm start
  ```

After starting AS's `api`, wait for `Commit` to display in `ap-abci` then you can start the flow.

## Test the flow with our examples

For those who run everything in same machine, use this script to start AS client.
```
API_SERVER_ADDRESS=http://localhost:8082 \
NDID_API_CALLBACK_IP=localhost \
NDID_API_CALLBACK_PORT=5003 \
npm start
```

Start `rp-client-app` and `idp-client-app` as in authentication-only flow.
In RP webpage, instead of press `Request Identity Verification` as in authentication flow, press `Request Identity Verification with Data Request`. The only visible different in UI is that IdP's webpage will display what data RP request (which is mockup in this client).

When authentication complete for data-request, `as-client-app` will automatically return mock data (which you can change or add delay to simulate AS delay).
You can see this data in RP's `api` terminal as well as `rp-client-app`.
