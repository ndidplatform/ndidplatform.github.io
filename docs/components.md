---
id: components
title: Components
---

The NDID platform node mainly consists of 3 components:

- **Distributed Ledger Technology (DLT)**

    A system for replicate, share, and synchronize public data across multiple nodes in the network. A type of DLT used is blockchain. [Tendermint](https://tendermint.com/) has been chosen as a blockchain layer of the platform since it can support required throughput. The logic that utilizes blockchain or smart contract or as Tendermint calls it *ABCI app* is implemented in Go.

    Repository: [smart-contract](https://github.com/ndidplatform/smart-contract)

- **API**

    A set of programmable interface for external applications to utilize the platform. It is also the part that coordinates between other components. The implementation is in JavaScript (Node.js).

    Repository: [api (main-server)](https://github.com/ndidplatform/api)

- **P2P Communication Channel**

    Peer-to-peer communication channel for private data exchange between platform nodes. The technology used is [ZeroMQ](http://zeromq.org/).

    Repository: [api (mq-server)](https://github.com/ndidplatform/api)