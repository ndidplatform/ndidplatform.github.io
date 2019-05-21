---
title: Usage (Mode 2)
---

# Usage (Mode 2)

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to illustrate the scenario outlined in the [quick overview](/#quick-overview) using concrete examples, to help make it easier to grasp how the platform works. This document is **not** the definitive source of information, just a learning aid. Please look at the [whitepaper](https://docs.google.com/document/d/1SKydNM-Nyox62m3vuvYgFYCr8ABVQV8RhjwiMjdCpQ8/edit#heading=h.qf2lmu8vfgym) for the full description of the platform.

</div>

## Flow Overview

1. RP creates a consent request.

   (RP receives create consent request result)

   (RP receives request status update)

2. IdP(s) receive a consent request.

3. IdP responses to a consent request.

   (IdP receives consent request response result)

   (RP receives request status updates)

   (**Note:** Step 3 is repeated for every IdPs)

4. (Optional) AS(es) receive a data request.

5. (Optional) AS responses to a data request by sending data to RP.

   (AS receives data response result)

   (RP receives request status updates)

6. (Optional) RP get data received from AS(es).

   (RP receives request status update)

   (**Note:** Step 5-6 is repeated for every ASes)

7. RP, IdP(s), and AS(es) get private messages sent over message queue and store to their databases.

8. RP, IdP(s), and AS(es) delete private messages sent over message queue.

<div markdown="1" class="flash mb-3">

**Note:** In the following example usage, RP requests a consent from 1 IdP and data from 1 AS. It is assumed that `as1` has `bank_statement` service provided.

</div>

## RP creates consent request (RP&rarr;Platform)

[POST /rp/requests/citizen_id/1234567890123](https://app.swaggerhub.com/apis/NDID/relying_party_api/3.0#/default/send_request_to_id)

HTTP Request Body

```json
{
  "reference_id": "28c3bb92-3721-4b99-98db-23d84faeb388",
  "callback_url": "http://localhost:9200/rp/callback",
  "mode": 2,
  "idp_id_list": ["idp1"],
  "data_request_list": [
    {
      "service_id": "bank_statement",
      "as_id_list": ["as1"],
      "min_as": 1,
      "request_params": "{\"format\":\"pdf\"}"
    }
  ],
  "request_message": "Test request message (data request) (mode 2)",
  "min_ial": 1.1,
  "min_aal": 1,
  "min_idp": 1,
  "request_timeout": 86400,
  "bypass_identity_check": false
}
```

HTTP Response Body (Status code: `202`)

```json
{
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "initial_salt": "y4F7V7kcrfQdFTLU4Mx4XA=="
}
```

**_IMPORTANT_**: RP **MUST** store `request_id` and `initial_salt` to their database for verification and auditing later if necessary.

## RP receives create consent request result (Platform&rarr;RP)

[POST /rp/request/a8ccb88e-4873-4c24-a1fc-5148e0a56965](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

HTTP Request Body

```json
{
  "node_id": "rp1",
  "type": "create_request_result",
  "success": true,
  "reference_id": "28c3bb92-3721-4b99-98db-23d84faeb388",
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "creation_block_height": "test-chain-NDID:101"
}
```

HTTP Response (Status code: `204`)

## RP receives request status update (Platform&rarr;RP)

[POST /rp/request/a8ccb88e-4873-4c24-a1fc-5148e0a56965](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

HTTP Request Body

```json
{
  "node_id": "rp1",
  "type": "request_status",
  "mode": 2,
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "status": "pending",
  "min_idp": 1,
  "answered_idp_count": 0,
  "closed": false,
  "timed_out": false,
  "service_list": [
    {
      "service_id": "bank_statement",
      "min_as": 1,
      "signed_data_count": 0,
      "received_data_count": 0
    }
  ],
  "response_valid_list": [],
  "block_height": "test-chain-NDID:101"
}
```

HTTP Response (Status code: `204`)

## IdP receives consent request (Platform&rarr;IdP)

[POST /idp/request](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/consent_request)

HTTP Request Body

- IdP has onboarded an identity in consent request (SID `citizen_id`:`1234567890123` or other SID in the same reference group).

  ```json
  {
    "node_id": "idp1",
    "type": "incoming_request",
    "mode": 2,
    "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
    "request_message": "Test request message (data request) (mode 2)",
    "request_message_hash": "o6PtyIkzQm5l7kYKIb7BwVfTldqSHhNyOx/LH4trQqA=",
    "request_message_salt": "TI1123/BKXQI6ou0EB0M6A==",
    "requester_node_id": "rp1",
    "min_ial": 1.1,
    "min_aal": 1,
    "data_request_list": [
      {
        "service_id": "bank_statement",
        "as_id_list": ["as1"],
        "min_as": 1
      }
    ],
    "initial_salt": "y4F7V7kcrfQdFTLU4Mx4XA==",
    "creation_time": 1558426238703,
    "creation_block_height": "test-chain-NDID:101",
    "request_timeout": 86400,
    "reference_group_code": "523bfc25-2451-49a7-8c5c-e83cb0823cf6"
  }
  ```

- RP create request with option `"bypass_identity_check": true` and IdP has not onboarded an identity in consent request.

  ```json
  {
    "node_id": "idp1",
    "type": "incoming_request",
    "mode": 2,
    "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
    "request_message": "Test request message (data request) (mode 2)",
    "request_message_hash": "o6PtyIkzQm5l7kYKIb7BwVfTldqSHhNyOx/LH4trQqA=",
    "request_message_salt": "TI1123/BKXQI6ou0EB0M6A==",
    "requester_node_id": "rp1",
    "min_ial": 1.1,
    "min_aal": 1,
    "data_request_list": [
      {
        "service_id": "bank_statement",
        "as_id_list": ["as1"],
        "min_as": 1
      }
    ],
    "initial_salt": "y4F7V7kcrfQdFTLU4Mx4XA==",
    "creation_time": 1558426238703,
    "creation_block_height": "test-chain-NDID:101",
    "request_timeout": 86400,
    "namespace": "citizen_id",
    "identifier": "1234567890123"
  }
  ```

HTTP Response (Status code: `204`)

## IdP responses to consent request (IdP&rarr;Platform)

IdP may or may not response to consent request. IdP response with status either `accept` or `reject` only when an individual has granted or gave consent to do so.

[POST /idp/response](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/consent_request)

HTTP Request Body

```json
{
  "reference_id": "a066fd0d-afa9-4eb0-9fd2-3aa7eb8c89fd",
  "callback_url": "http://localhost:9100/idp/callback",
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "ial": 2.3,
  "aal": 3,
  "status": "accept",
  "accessor_id": "65ecc598-7b2c-4f56-b74b-d265d8d0c0a9"
}
```

HTTP Response (Status code: `202`)

## IdP receives accessor encrypt callback (Platform&rarr;IdP)

[POST /idp/accessor/encrypt](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/request_for_accessor_to_encrypt)

HTTP Request Body

```json
{
  "node_id": "idp1",
  "type": "accessor_encrypt",
  "reference_id": "a066fd0d-afa9-4eb0-9fd2-3aa7eb8c89fd",
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "accessor_id": "65ecc598-7b2c-4f56-b74b-d265d8d0c0a9",
  "accessor_public_key": "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzPqGBJYmQRCDrVtvqHjn\r\nXjUfHQw2ej13w//tzK3k73/NzPfyky/C/o+XEnwGpSVuwlRjIrcXEAR3d3jEigVy\r\n3IT/ng9TzyiINLBWw04bRwceQBLYnLHMpCm4KjlbDRHEDtBUffy4WdIK0UzEI0LT\r\nKZ6hT8u305KFGcCrigfrAK0r1ljrUHWLwAZmjcso1joN04YiPbrOwqQX+GQ3l2b3\r\nYKz4aHku0QtAEKpcfFqNuMtrbobhpyjwdi0vsms8U+crsEge8EDHTPONS6XOCdfD\r\n6SvNFpy2rugR2JCZkGbbYu3OSGuP04rzjoYPIxUyNzKskCa7s7n3XWRLF4AK8TMt\r\nDQIDAQAB\r\n-----END PUBLIC KEY-----\r\n",
  "key_type": "RSA",
  "padding": "none",
  "request_message_padded_hash": "SM8Cctj6q4qpxaPzLYxKDqq5qnA3BWS6sKKBgTNGpIFN+WSfK+PS9lW3b7u6Bm4TpklMEcR/ESPosTcy69E3wj3IJvxq1XuMjwOmPOO70z035pIEbH2Jn64FCF8jtiVjqsso01XETNTAoMlI0BXmAYTz5w4gxclUcr/j3NKv4UCawbb/dUOH3LbuhiZh1QpeP9ID8sqo2d7VGEZhTH6FS2a4+yqnUtGhflBh5A1Q1KzBIRx2hDgk8Jx0HOlfxRKgqRcrqwTG8FkbdkUl02w0NWTmkbBghkchNt4M2BR9DUwqBMgliuQFVWavon1bpah7o5iRVg4GHcdemPLAThu7xA=="
}
```

HTTP Response Body (Status code: `200`)

```json
{
  "signature": "Cx5lCka1cMImvFFbfpyniolyBYxgozH6QrBNEmf1jNsWO2KzHcC4qAVYce0n5+LvQVfnZnkrwB3Lz8Au4sy6a7FjeEGL0aABi1m68P/Dez3mPXsq5N6XZd0GvLHmGvjrqd0xYNtRwXmNyB0W7kzLqzOGv0FiwG6o2m1VxjjkTXoJyASafOVrTx//OH+LjSdFA79hcL68KggyRMJS2IiKWMYWPsUXyB3i43rH1zqYhuADPGmbWk/+JqQCXXY0Ry4j1qADkrNkuO98RGTzb2A0OqtRb6YC2nBdKLDENrDvI85DRo9Bp6gjbgbaYocwnCPYD2dsgFWcFJXHDklvX7VWSg=="
}
```

## IdP receives response result (Platform&rarr;IdP)

[POST /idp/response](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/post_idp_response)

HTTP Request Body

```json
{
  "node_id": "idp1",
  "type": "response_result",
  "success": true,
  "reference_id": "a066fd0d-afa9-4eb0-9fd2-3aa7eb8c89fd",
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631"
}
```

HTTP Response (Status code: `204`)

## RP receives request status update (Platform&rarr;RP)

[POST /rp/request/e3cb44c9-8848-4dec-98c8-8083f373b1f7](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

HTTP Request Body

```json
{
  "node_id": "rp1",
  "type": "request_status",
  "mode": 2,
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "status": "confirmed",
  "min_idp": 1,
  "answered_idp_count": 1,
  "closed": false,
  "timed_out": false,
  "service_list": [
    {
      "service_id": "bank_statement",
      "min_as": 1,
      "signed_data_count": 0,
      "received_data_count": 0
    }
  ],
  "response_valid_list": [
    {
      "idp_id": "idp1",
      "valid_signature": true,
      "valid_ial": true
    }
  ],
  "block_height": "test-chain-NDID:103"
}
```

HTTP Response (Status code: `204`)

## AS receives data request (Platform&rarr;AS)

[POST /service/bank_statement](https://app.swaggerhub.com/apis/NDID/as_callback/3.0#/default/data_request)

HTTP Request Body

```json
{
  "node_id": "as1",
  "type": "data_request",
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "mode": 2,
  "namespace": "citizen_id",
  "identifier": "eed63657-d880-4ebb-81c9-5f7be9200019",
  "service_id": "bank_statement",
  "request_params": "{\"format\":\"pdf\"}",
  "requester_node_id": "rp1",
  "response_signature_list": [
    "Cx5lCka1cMImvFFbfpyniolyBYxgozH6QrBNEmf1jNsWO2KzHcC4qAVYce0n5+LvQVfnZnkrwB3Lz8Au4sy6a7FjeEGL0aABi1m68P/Dez3mPXsq5N6XZd0GvLHmGvjrqd0xYNtRwXmNyB0W7kzLqzOGv0FiwG6o2m1VxjjkTXoJyASafOVrTx//OH+LjSdFA79hcL68KggyRMJS2IiKWMYWPsUXyB3i43rH1zqYhuADPGmbWk/+JqQCXXY0Ry4j1qADkrNkuO98RGTzb2A0OqtRb6YC2nBdKLDENrDvI85DRo9Bp6gjbgbaYocwnCPYD2dsgFWcFJXHDklvX7VWSg=="
  ],
  "max_aal": 3,
  "max_ial": 2.3,
  "creation_time": 1558426238703,
  "creation_block_height": "test-chain-NDID:101",
  "request_timeout": 86400
}
```

HTTP Response (Status code: `204`)

## AS responses to data request (AS&rarr;Platform)

[POST /as/data/10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631/bank_statement](https://app.swaggerhub.com/apis/NDID/authoritative_source_api/3.0#/default/send_data)

HTTP Request Body

```json
{
  "reference_id": "7ed191f5-ccdf-4403-a229-6a2407d2b847",
  "callback_url": "http://localhost:9300/as/callback",
  "data": "{\"test\":\"test\",\"withEscapedChar\":\"test|fff||ss\\\\|NN\\\\\\\\|\",\"arr\":[1,2,3]}"
}
```

HTTP Response (Status code: `202`)

## AS receive data response result (AS&rarr;Platform)

[POST /as/data](https://app.swaggerhub.com/apis/NDID/as_callback/3.0#/default/post_as_data)

HTTP Request Body

```json
{
  "node_id": "as1",
  "type": "send_data_result",
  "success": true,
  "reference_id": "7ed191f5-ccdf-4403-a229-6a2407d2b847",
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631"
}
```

HTTP Response (Status code: `204`)

## RP receives request status update (Platform&rarr;RP)

[POST /rp/request/e3cb44c9-8848-4dec-98c8-8083f373b1f7](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

HTTP Request Body

```json
{
  "node_id": "rp1",
  "type": "request_status",
  "mode": 2,
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "status": "confirmed",
  "min_idp": 1,
  "answered_idp_count": 1,
  "closed": false,
  "timed_out": false,
  "service_list": [
    {
      "service_id": "bank_statement",
      "min_as": 1,
      "signed_data_count": 1,
      "received_data_count": 0
    }
  ],
  "response_valid_list": [
    {
      "idp_id": "idp1",
      "valid_signature": true,
      "valid_ial": true
    }
  ],
  "block_height": "test-chain-NDID:105"
}
```

HTTP Response (Status code: `204`)

## RP receives request status update (Platform&rarr;RP)

[POST /rp/request/e3cb44c9-8848-4dec-98c8-8083f373b1f7](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

HTTP Request Body

```json
{
  "node_id": "rp1",
  "type": "request_status",
  "mode": 2,
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "status": "completed",
  "min_idp": 1,
  "answered_idp_count": 1,
  "closed": false,
  "timed_out": false,
  "service_list": [
    {
      "service_id": "bank_statement",
      "min_as": 1,
      "signed_data_count": 1,
      "received_data_count": 1
    }
  ],
  "response_valid_list": [
    {
      "idp_id": "idp1",
      "valid_signature": true,
      "valid_ial": true
    }
  ],
  "block_height": "test-chain-NDID:107"
}
```

HTTP Response (Status code: `204`)

## RP receives request status update (Platform&rarr;RP)

[POST /rp/request/e3cb44c9-8848-4dec-98c8-8083f373b1f7](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

HTTP Request Body

```json
{
  "node_id": "rp1",
  "type": "request_status",
  "mode": 2,
  "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
  "status": "completed",
  "min_idp": 1,
  "answered_idp_count": 1,
  "closed": true,
  "timed_out": false,
  "service_list": [
    {
      "service_id": "bank_statement",
      "min_as": 1,
      "signed_data_count": 1,
      "received_data_count": 1
    }
  ],
  "response_valid_list": [
    {
      "idp_id": "idp1",
      "valid_signature": true,
      "valid_ial": true
    }
  ],
  "block_height": "test-chain-NDID:109"
}
```

HTTP Response (Status code: `204`)

## RP gets data received from AS (RP&rarr;Platform)

[GET /rp/request_data/10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631](https://app.swaggerhub.com/apis/NDID/relying_party_api/3.0#/default/get_request_data)

HTTP Response Body (Status code: `200`)

```json
[
  {
    "source_node_id": "as1",
    "service_id": "bank_statement",
    "source_signature": "PqfwdzUIekBzsAVkGS1k34PPR4NShSm9KjjEuWZ4fPaUe4E/cOtxOsW2vPQXZgAq6bkgcmtoyHxYCi4z9OpRIGfr1yVVOUhZCOIkpYvE7rmjPP7yQlDcYUw4kwEgVAQpow/qmnV2Aaf/9HJRDnrnpVNAEJeafQNEtzvx2N1u0w9Ymm6GLZs7O6dfOwr6zq1Jdk6u8fFW1Uyhflq2o5u6airpZ5GZwCuRU/OjxU4k/MhYiO4szAR3OYXfPyxVk/YFRXb+xdhZjUwdY1ggPLNMJzzWcF93jolyo7tp3GPUfu+2uwoivFo1YPHTGeBEp97rk+bKF25+pwwckWrv8WbkYw==",
    "signature_sign_method": "RSA-SHA256",
    "data_salt": "kl7zyO1pS54WQvqZ4DOfaA==",
    "data": "{\"test\":\"test\",\"withEscapedChar\":\"test|fff||ss\\\\|NN\\\\\\\\|\",\"arr\":[1,2,3]}"
  }
]
```

## RP, IdP, and AS get private messages sent over message queue (RP,IdP,AS&rarr;Platform)

RP, IdP(s), and AS(es) **MUST** get messages sent over message queue and store to their databases for verification and auditing later.

[GET /utility/private_messages/10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/get_utility_private_messages__request_id_)

HTTP Response Body (Status code: `200`)

```json
[
  {
    "message": {
      "type": "idp_response",
      "request_id": "10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631",
      "mode": 2,
      "accessor_id": "65ecc598-7b2c-4f56-b74b-d265d8d0c0a9",
      "idp_id": "idp1",
      "chain_id": "test-chain-NDID",
      "height": 103
    },
    "direction": "inbound",
    "source": {
      "node_id": "idp1"
    },
    "signature": "qVZS1oETp4/YWokjvcfDmof2QVGa91Tj/g/ulS2Uj2YxuXxZU15ZJ3nhqQprANiguAnYUFBftOeeCXCRHNUZvAWYPsDfN2LYmJ1oIU9wJlRQIPr4xTiu1KNwWbo06M3hixB7dAyaUjNCrzcZimlkF4dTbNc04qYD3bXwfx3OA+37MrX8lMyO+6njteqSQLqdruzc3YgXshkTX9ArMM+80htsCAZhYIubDlfaFHCLT5jEfiFre9A9HmzPl4o/pktZOkQFysHIidOBlRULLFyvMn4QDFySVfvyyc8m6k1Ux8yULD1EK8dKFAbScqRCxpYoUwQzSl4l0Vuh9+zzXQ6niA==",
    "timestamp": 1558426239945
  },
  ...
]
```

## RP, IdP, and AS delete private messages sent over message queue (RP,IdP,AS&rarr;Platform)

After RP, IdP(s), and AS(es) get messages sent over message queue and store to their databases, they **MUST** delete private messages cached on the platform local node.

[GET /utility/private_message_removal/10606caea38ce5ab34d0ffc94d856d622689c8bb15f45653559be5d3bc72f631](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/post_utility_private_message_removal__request_id_)

HTTP Response Body (Status code: `204`)
