---
title: Deployment
---

# Deployment

<div markdown="1" class="flash mb-3 flash-warn">

**IMPORTANT:** When node sending or receiving message to/from another node through private channel or message queue, it will store all messages, both inbound and outbound, to Redis (memory). Client app **MUST** call an API to remove these messages after they've fetched the messages and store them in their local database. If client were to neglect this, node may fail to function. See [Private Messages](/deployment.html#private-messages) section.

</div>

<div markdown="1" class="flash mb-3 flash-warn">

**IMPORTANT:** When RP node receives data from AS node, it will store data to Redis (memory). RP client app **MUST** call an API to remove stored data after they've fetched and store them in their local database. If client were to neglect this, node may fail to function. See [Data received from AS](/deployment.html#data-received-from-as) section.

</div>

## Hardware

## Private Messages

Private messages are messages which is sent or received via private channel or message queue. They contain data private to participating parties/nodes in a request. These messages should be kept as an evidence in case there is a dispute later on.

Messages are saved to Redis once node sent a message to another node or received a message from another node and they will not be automatically removed. Client **MUST** call an API to remove these messages themselves. Failure to do so may cause node to stop functioning due to out of memory error or Redis operation timeout.

### Related APIs

You can fetch private messages by request ID using API [GET `/utility/private_messages/{request_id}`](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/get_utility_private_messages__request_id_){:target="\_blank" rel="noopener"}

You will most likely want to remove messages by request ID through API [POST `/utility/private_message_removal/{request_id}`](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/post_utility_private_message_removal__request_id_){:target="\_blank" rel="noopener"} after the request is closed or timed out and you have fetched and saved messages to your local database.

You can also remove all messages using API [POST `/utility/private_message_removal`](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/post_utility_private_message_removal){:target="\_blank" rel="noopener"}.

## Data received from AS

When RP receives data message from AS and has internally checked and set data received to the blockchain, it will save data to Redis. Stored data will not be automatically removed. RP client **MUST** call an API to remove data themselves. Failure to do so may cause node to stop functioning due to out of memory error or Redis operation timeout.

### Related APIs

You can fetch data by request ID using API [GET `/rp/request_data/{request_id}`](https://app.swaggerhub.com/apis/NDID/relying_party_api/3.0#/default/get_request_data){:target="\_blank" rel="noopener"}

You will most likely want to remove data by request ID through API [POST `/rp/request_data_removal/{request_id}`](https://app.swaggerhub.com/apis/NDID/relying_party_api/3.0#/default/post_rp_request_data_removal__request_id_){:target="\_blank" rel="noopener"} after you have fetched and saved data to your local database.

You can also remove all data using API [POST `//rp/request_data_removal`](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/post_utility_private_message_removal){:target="\_blank" rel="noopener"}.
