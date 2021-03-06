---
id: getting-started-setup
title: Setup
---

## Tendermint and ABCI app

There are several options to install Tendermint and ABCI app bundle.

- Build from source
- Build Docker image locally from source
- Use Docker image provided on Docker Hub

### Build from source

1. Make sure you [meet the prerequisites](https://github.com/ndidplatform/smart-contract#prerequisites).

2. Clone [smart-contract](https://github.com/ndidplatform/smart-contract) repository.

   ```sh
   mkdir -p $GOPATH/src/github.com/ndidplatform/smart-contract

   git clone https://github.com/ndidplatform/smart-contract.git $GOPATH/src/github.com/ndidplatform/smart-contract
   ```

3. (Optional) Checkout desired branch or tag.

   Example:

   ```sh
   cd $GOPATH/src/github.com/ndidplatform/smart-contract
   git checkout development
   ```

4. Get dependencies.

   ```sh
   cd $GOPATH/src/github.com/ndidplatform/smart-contract
   dep ensure
   ```

5. (Optional) Patch Tendermint LevelDB adapters

   ```sh
   git apply $GOPATH/src/github.com/ndidplatform/smart-contract/patches/tm_goleveldb_bloom_filter.patch && \
   git apply $GOPATH/src/github.com/ndidplatform/smart-contract/patches/tm_cleveldb_cache_and_bloom_filter.patch
   ```

6. [Build](https://github.com/ndidplatform/smart-contract#build) from source.

7. Init Tendermint

   ```sh
   ./did-tendermint --home ./ndid_tm_home init
   ```

8. Configure Tendermint

   Change the following configuration in `./ndid_tm_home/config/config.toml`.

   ```toml
   recheck = false

   create_empty_blocks = false
   ```

   If you run on a local network, additional configuration should be changed.

   ```toml
   addr_book_strict = false

   allow_duplicate_ip = true
   ```

### Build Docker image locally from source

Install [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) if you haven't already.

1. Clone [smart-contract](https://github.com/ndidplatform/smart-contract) repository.

2. (Optional) Checkout desired branch or tag.

   Example:

   ```sh
   git checkout development
   ```

3. Build an image.

   ```sh
   cd ./smart-contract/docker

   ./build.sh
   ```

4. Init Tendermint

   ```sh
   docker run --rm --volume $PWD/ndid_tm_home:/tendermint ndidplatform/did-tendermint init
   ```

5. Configure Tendermint

   Change the following configuration in `./ndid_tm_home/config/config.toml`.

   ```toml
   recheck = false

   create_empty_blocks = false
   ```

   If you run on a local network, additional configuration should be changed.

   ```toml
   addr_book_strict = false

   allow_duplicate_ip = true
   ```

### Use Docker image provided on Docker Hub

Install [Docker](https://docs.docker.com/install/) if you haven't already.

1. Pull an image from [Docker Hub](https://hub.docker.com/r/ndidplatform/did-tendermint).

   ```sh
   docker pull ndidplatform/did-tendermint
   ```

2. Init Tendermint

   ```sh
   docker run --rm --volume $PWD/ndid_tm_home:/tendermint ndidplatform/did-tendermint init
   ```

3. Configure Tendermint

   Change the following configuration in `./ndid_tm_home/config/config.toml`.

   ```toml
   recheck = false

   create_empty_blocks = false
   ```

   If you run on a local network, additional configuration should be changed.

   ```toml
   addr_book_strict = false

   allow_duplicate_ip = true
   ```

### Setup more Tendermint nodes

You can setup as many Tendermint node as you like. For example, setting up Tendermint node for RP (rp1).

1. Init Tendermint

   ```sh
   ./did-tendermint --home ./rp1_tm_home init
   ```

   or with Docker

   ```sh
   docker run --rm --volume $PWD/rp1_tm_home:/tendermint ndidplatform/did-tendermint init
   ```

2. Copy and replace `genesis.json` in `./rp1_tm_home/config/` with the one from NDID node config directory `./ndid_tm_home/config/genesis.json`

3. Repeat the same process as above (_Configure Tendermint_ step) but with `./rp1_tm_home/config/config.toml` and change additional configurations.

   - Get NDID Tendermint node ID

     ```sh
     ./did-tendermint --home ./ndid_tm_home show_node_id
     ```

     or with Docker

     ```sh
     docker run --rm --volume $PWD/ndid_tm_home:/tendermint ndidplatform/did-tendermint show_node_id
     ```

   - Copy node ID from an output of above command in place of \<TM_NODE_ID\> in config.

     ```toml
     seeds="<TM_NODE_ID>@127.0.0.1:26656"
     ```

## API Server

There are several options to install API server.

- Build from source
- Build Docker image locally from source
- Use Docker image provided on Docker Hub

### Build from source

1. Make sure you [meet the prerequisites](https://github.com/ndidplatform/api#prerequisites).

2. Clone [api](https://github.com/ndidplatform/api) repository.

3. Go to cloned directory.

   ```sh
   cd ./api
   ```

4. Install dependencies

   ```sh
   cd ./main-server
   npm install

   cd ../mq-server
   npm install

   cd ../ndid-logger
   npm install
   ```

### Build Docker image locally from source

Install [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) if you haven't already.

1. Clone [api](https://github.com/ndidplatform/api) repository.

2. (Optional) Checkout desired branch or tag.

   Example:

   ```sh
   git checkout development
   ```

3. Build an image.

   ```sh
   cd ./api/docker

   ./build.sh
   ```

### Use Docker image provided on Docker Hub

Install [Docker](https://docs.docker.com/install/) if you haven't already.

- Pull an image (API main) from [Docker Hub](https://hub.docker.com/r/ndidplatform/api).

  ```sh
  docker pull ndidplatform/api
  ```

- Pull an image (MQ service server) from [Docker Hub](https://hub.docker.com/r/ndidplatform/mq).

  ```sh
  docker pull ndidplatform/mq
  ```
