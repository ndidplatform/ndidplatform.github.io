---
title: Example data-request flow
---

# Example Data-request Flow

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to explain the PoC for data-request scenario outlined in [Technical overview](/technical-overview) for better understanding for further implementation. This document is **not** the definitive source of information, also the PoC mention here is **may or may not** use in production system.

</div>

## Before we start

Please read [Example authentication flow](/example-authen-flow.html) before read this document.

Similar to IDP's registration in authentication flow, AS will automatically register itself and its service list to platform every time it start.
In production, however, it will only register once.

Also, for backward compatability, AS's tendermint node is not acting as validator.

## To run the example flow

You need to run those processes in authentication flow and run 3 more processes for AS role.

Again, if you want to run all processes on **the same machine without VM**, you can use these scripts to start addtional processes (3 terminals).

At `$GOPATH/src/github.com/digital-id/ndid-smart-contract`

- as-abci
  ```
  CALLBACK_URI=http://localhost:3002/callback go run abci/server.go tcp://127.0.0.1:46002
  ```
- as-tendermint
  ```
  tendermint --home ./config/tendermint/AS unsafe_reset_all && \
  tendermint --home ./config/tendermint/AS node --consensus.create_empty_blocks=false
  ```

Wait for **both** `as-abci` to display
```
Commit
Commit
```
before proceeding to `ndid-api` directory

- as-api
  ```
  ROLE=as \
  MQ_CONTACT_IP=127.0.0.1 \
  MQ_BINDING_PORT=5557 \
  ABCI_APP_CALLBACK_PORT=3002 \
  SERVER_PORT=8082 \
  npm start
  ```

After starting `as-api`, wait for `Commit` to display in `ap-abci` then you can start the flow.

## Test the flow with POSTMAN

You can download [POSTMAN collection](/assets/request-data-flow-postman.json) and import to POSTMAN.
The only difference from `authen-flow` is that `data_request_list` is now not empty.

The test steps is same as `authen-flow` but for these flow, when the request status is `complete`,
AS will receive callback from platform along with message from RP via message queue and check the integrity of message and IDP's signature(s) for that request, then send data back to RP via message queue.
This steps is done automatically in this example (`as-api` returns mock data).
Note that the data sent back to RP **may not** be real data, but may be a token of some kind for RP to retrieve data by another channel.
This can be used to offload tha platform if the data is large, or to benefit AS to enforce another access control to the data.
Example: AS may send a URL for the data to RP which is only valid for some period of time.

## Test the flow with our client-example

In RP webpage, instead of press `verify identity` as in authentication flow, press `verify identity with data request`. The only visible different in UI is that IDP's webpage will display what data RP request (which is mockup in this client).