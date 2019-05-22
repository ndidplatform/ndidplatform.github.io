---
title: Technical Overview
---

# Technical Overview

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to illustrate the scenario outlined in the [quick overview](/#quick-overview) using concrete examples, to help make it easier to grasp how the platform works. This document is **not** the definitive source of information, just a learning aid. Please look at the [whitepaper](https://docs.google.com/document/d/1SKydNM-Nyox62m3vuvYgFYCr8ABVQV8RhjwiMjdCpQ8/edit#heading=h.qf2lmu8vfgym) for the full description of the platform.

</div>

<div markdown="1" class="flash mb-3">

**Recommended reading:** If you haven’t read it yet, we highly recommend that you read the [Digital Identity Guideline for Thailand – Overview and Glossary (DRAFT)](https://standard.etda.or.th/?p=8577) document to understand the overall process of the Digital ID model, as well as precise meanings of each term.

</div>

## Scenario: Requesting a bank statement for Visa application

In this scenario, the User is at an embassy to apply for a Visa.
The embassy is the **Relying Party (RP)** as they relies on NDID platform
to verify the user’s identity through an **Identity Provider (IdP)**
and retrieving the bank statement form the **Authoritative Source (AS)**, the bank.

## Background

- Each participating party (RP, IdP, AS) runs the **NDID Node**,
  which operates the NDID Platform in a decentralized way.

  From the whitepaper:

  > The system is decentralized. Every participants shall host their own digital identification platform. The platform uses blockchain to synchronize necessary database between each participant. In term of blockchain, each participant becomes a node in the blockchain system.
  >
  > ![Architecture diagram](images/architecture.png)

- The **NDID Node:**

  - Exposes a **REST API** for integration with client applications.
  - Synchronizes the shared state (transaction history) through blockchain technology (Tendermint).
  - Stores local state specific to the node.
  - Communicates securely with other nodes through message queue.

  > ![NDID Node](images/ndid-node.png)

  **Communication between node:**

  > ![Communication between nodes](images/communication.png)

- Given the following node exists:

  | participant | node\_id |
  | --- | --- |
  | RP | <x-guid>RP_06626-b9c7-4c52-abf2-019220637c91</x-guid> |
  | IdP | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> |
  | AS | <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> |

  Note: A node ID may be a GUID, but we use this format to make the document easier to read.

- When a party who wants to joins the platform registers, NDID will add their node information to the blockchain

  | node\_id | public\_key |
  | --- | --- |
  | <x-guid>RP_06626-b9c7-4c52-abf2-019220637c91</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+RP+svJPfe… |
  | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+IdP+lk1ax… |
  | <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQD+AS+n0IWKC… |

- When an NDID Node joins the platform, they have to advertise their message queue contact address (IP address and port).
  This data will go into the blockchain:

  <div class="flash mb-3 flash-warn">
    @todo #2 Also give a name to each of these mappings.
  </div>

  - **node_id → message queue address mapping** to allow private data communication via message queue.

    | node\_id | message_queue_address |
    | --- | --- |
    | <x-guid>RP_06626-b9c7-4c52-abf2-019220637c91</x-guid> | 129.45.112.199:5000 |
    | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | 65.153.47.21:5000 |
    | <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> | 64.94.137.169:5000 |

- **IdP Enrolment/Onboarding:** The User must have their identities registered with an IdP (through an “enrolment” process).
  Check out the flow [in the whitepaper](https://docs.google.com/document/d/1SKydNM-Nyox62m3vuvYgFYCr8ABVQV8RhjwiMjdCpQ8/edit#heading=h.fw1fc2xwjef7).

  First, the user has to apply to enrol with the IdP.
  The IdP will verify the applicant’s identity (identity proofing).
  If the identity proofing process is very strict,
  the registered identity will have a high **IAL (Identity Assurance Level)**.

  In this scenario, the user onboarded with the IDP using his **citizen ID, 1-2345-67890-12-3**.

  - **How identity data is stored:** Some parts of data related to each identity is stored privately by each participating party, while others are on the blockchain.

    > ![Identity data](images/identity-data.png)

  - The IdP holds this data privately:

    | namespace | identifier | reference_group_code | accessor\_id | accessor\_private\_key |
    | --- | --- | --- | --- | --- |
    | citizen_id | 1234567890123 | <x-guid>0280cf8e-de45-4e4e-aec7-c7a61d11b643</x-guid> | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | <x-pk>-----BEGIN RSA PRIVATE KEY-----<br />MIIEowIBAAKCAQEAxy/CSXWu...</x-pk> |

    Note that each identity / reference_group_code may have more than one accessor (id and private key) per IdP

  - These data are stored on the blockchain:

    <div class="flash mb-3 flash-warn">
      @todo #2 Give a name to each of these mappings.
    </div>
    
    > ![Identity data on blockchain diagram](images/identity-data-diagram.png)

    - **reference_group_code → sid mapping**

      | reference_group_code | namespace | identifier |
      | --- | --- | --- |
      | <x-guid>0280cf8e-de45-4e4e-aec7-c7a61d11b643</x-guid>  | hash('citizen_id/1234567890123') | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> |

    - **reference_group_code → node_id (IdP) and accessor mapping**

      | reference_group_code | node\_id | accessor_id |
      | --- | --- |
      | <x-guid>0280cf8e-de45-4e4e-aec7-c7a61d11b643</x-guid> | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> |

    - **Accessor** for signing a consent request response:

      | accessor\_id | accessor\_type | accessor\_key |
      | --- | --- | --- | --- |
      | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | RSA-2048 | AAAAB3NzaC1yc2EAAAADAQABAAAB… |

Given these data, let’s proceed with the scenario.

<div markdown="1" class="flash mb-3">

**Note:** The request body is written in a format similar to YAML, for ease of reading.

</div>

## RP&rarr;Platform: [POST /rp/requests/citizen_id/01234567890123](https://app.swaggerhub.com/apis/NDID/relying_party_api/3.0#/default/send_request_to_id)

```yaml
# Reference ID is used in case of communication error between RP and platform,
# to prevent the same request from being executed twice in short timeframe.
reference_id: 'e3cb44c9-8848-4dec-98c8-8083f373b1f7'

# Callback URL to report result of creating request since an API is asynchronous and request status when there is an update
callback_url: 'https://<rp-webservice>/webhook'

mode: 2

# List of IdPs. May be empty to send to all IdPs where conditions are met (knwon identity, IAL, AAL).
idp_id_list: []

# List of data to request from AS.
# This can be empty.
# Multiple as_id can be provided as a list.  If the list is empty, then the platform will send request to all AS providing the service.  All AS should provide the same interface for the same service_id, so we can send the same set of params to all of them.
# Count is the number of expected response.  One service_id maybe provided by multiple ASes, but RP may require answer from only n number of them, this number is count.  If count is larger than the number of item in [as_id] list, then count is set as count([as_id]).  (e.g. count <= count([as_id]))
data_request_list: [{ 
    service_id: 'bank_statement', 
    as_id_list: ['AS1', 'AS2'],
    min_as: 1,
    request_params: { format: 'pdf' } 
  }, ...
]

# Message to display to user to ask for consent.
# (RP must send message in correct language.)
request_message: 'Please allow the embassy to access your bank statement for purpose of obtaining a Visa.'

# Identity Assurance Level. Assurance level of KYC process.
# Examples:
#   IAL1 = self-asserted. e.g. email/facebook account
#   IAL2 = rudimentary identity verification. e.g. copy of id card
#   IAL3 = more strict verification, utilizing biometric data
min_ial: 2.1

# Authentication assurance level. Assurance level of authentication process.
# Examples:
#   AAL1 = single-factor authentication. e.g. username/password
#          (not allowed for IAL1)
#   AAL2 = two-factor authentication. e.g. PIN + OTP
#   AAL3 = multi-factor authentication, utilizing cryptographic key.
#          e.g. USB token containing password-protected private key
min_aal: 1

# Minimum number of IdP approvals for auth request to be confirmed.
min_idp: 1

# Transaction timeout.
# request_timeout is the request transaction timeout
request_timeout: 259200 # seconds = 3 days

bypass_identity_check: false
```

The API validates the request, generates a request ID and returns a response:

```yaml
200 OK

request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
```

This `request_id` can be used to check the status of request through [GET /utility/requests/{request_id}](https://app.swaggerhub.com/apis/NDID/utility/3.0#/default/get_request_status) API.

The `reference_id` &rarr; `request_id` mapping is stored in the node’s local storage, in case of communication error, to make this request idempotent.

| reference_id | request_id |
| --- | --- |
| <x-guid>e3cb44c9-8848-4dec-98c8-8083f373b1f7</x-guid> | <x-guid>ef6f4c9c-818b-42b8-8904-3d97c4c520f6</x-guid> |

The information about the request is stored in the blockchain.

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
mode: 2
idp_id_list: ['IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0']
min_idp: 1
min_aal: 1
min_ial: 2.1
request_timeout: 259200
data_request_list: [{ 
    service_id: 'bank_statement', 
    as_id_list: ['AS1', 'AS2'],
    min_as: 1,
    request_params_hash: hash({ format: 'pdf' })
  },...
]
request_message_hash: hash('Please allow...' + request_message_salt)

# Note: Neither {ns}/{id} nor its hash is stored here.
#       We want to keep each transaction private.
#       Elsewise, one could brute-force to find a transaction of any ID.
#       Request message salt is random-generated by platform, it's used for 
#       preventing two message hash to look identical.
```

## Communication from RP’s Node to IdP’s Node

The target node IDs are obtained.

| reference_group_code | node\_id |
| --- | --- |
| <x-guid>0280cf8e-de45-4e4e-aec7-c7a61d11b643</x-guid> | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> |

Then the corresponding public key is obtained.

| node\_id | public\_key |
| --- | --- |
| <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+IdP+lk1ax… |

Then a message is constructed, encrypted with the public key, and sent to the nodes through message queue:

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
mode: 2
reference_group_code: '0280cf8e-de45-4e4e-aec7-c7a61d11b643'
data_request_list: [{ 
    service_id: 'bank_statement', 
    as_id_list: ['AS1', 'AS2'],
    min_as: 1
  },...
]
request_message: 'Please allow...'
request_message_salt: '<random>'
min_ial: 2.1
min_aal: 1
min_idp: 1
request_timeout: 259200
```

IsP Node receives the request message from message queue and decrypts it.

It reads the request from the blockchain:

- Verify that the parameters (`min_idp`, `min_aal`, `min_ial`, `timeout`, `data_request_list`) matches.
- Verify that `hash(request_message | salt) === message_hash`.
- Check with the blockchain if the request is still necessary. (Request may be fulfilled by another IdP, in case the user onboarded with multiple IdPs.)

## Platform&rarr;IdP: [POST /idp/request](https://app.swaggerhub.com/apis/NDID/idp_callback/3.0#/default/consent_request)

At this point, IDP Node has checked that the consent is still needed. It issues a webhook to IDP’s web service, passing the above message.

## IdP&rarr;User

IdP asks the user to:

- Verify their identity (authentication).
- Give consent to allow RP to access the data from AS (data access authorization).

The message from RP is shown to the user:<br />“Please allow the embassy to access your bank statement for purpose of obtaining a Visa.”

Different ways of authentication has different security level.
Authentication using PIN or username/password combination can be considered low security, while public-key authentication can be considered having higher security.
Authentication method that has higher security gets a higher **AAL (Authentication Assurance Level)**.

## User&rarr;IdP

In this example, the user gave IdP the consent.

## IdP&rarr;Platform: [POST /idp/response](https://app.swaggerhub.com/apis/NDID/identity_provider/3.0#/default/respond_to_request)

IdP sends a response to consent request

```yaml
reference_id: 'fb912b27-7ae1-4417-9f72-a192560051f7'
callback_url: 'https://<idp-webservice>/callback'
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
ial: 2.1
aal: 3
status: 'accept'
accessor_id: 'acc_f328-53da-4d51-a927-3cc6d3ed3feb'
```

Then the platform requests `signature` from IdP by calculating `request_message_hash` with custom scheme to preserve privacy and sending to IdP to encrypt (without padding) with accessor private key along with `accessor_id`.

IdP retrieves the `accessor_id` and `accessor_private_key` from private storage.

| namespace | identifier | accessor\_id | accessor\_private\_key |
| --- | --- | --- | --- | --- |
| citizen_id | 1234567890123 | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | <x-pk>-----BEGIN RSA PRIVATE KEY-----<br />MIIEowIBAAKCAQEAxy/CSXWu...</x-pk> |

It then generates a signature by encrypting (without padding) the `request_message_hash` with that private key.

- `<signature>` = `RSA256_without_padding(request_message_hash, accessor_private_key)`

<div class="flash mb-3 flash-warn">
  @todo #2 Should the message to be signed also include the user’s approval status?
   Otherwise, the signature for CONFIRM is identical to REJECT…
</div>

Platform will then send these data to RP via message queue, and store these part of the data to blockchain.
```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
mode: 2
accessor_id: 'acc_f328-53da-4d51-a927-3cc6d3ed3feb'
status: 'accept'
idp_node_id: 'node id of idp'
```

## Platform&rarr;RP: (via message queue)

Before AS can give out the data (or before the RP can accept this confirmation), they must verify that the user has really given the required consent and this consent is recorded in the blockchain.

However, a request in the blockchain does not contain any identity information. But somehow, we need to verify that the `request_id` really corresponds to the identity in question. Thus, a custom scheme for signing a request message is used.

RP must verify signature that it indeed sign with private key corresponse to `accessor_id`

## Platform&rarr;RP: [POST /rp/request/e3cb44c9-8848-…](https://app.swaggerhub.com/apis/NDID/rp_callback/3.0#/default/request_update)

At this point, RP-Node sees the above transaction committed in the blockchain.
It knows that the authentication request has been approved.
(However, data has not arrived yet.)

It notifies the RP through callback URL.

<div markdown="1" class="flash mb-3">

**Note:** Every time request status is updated, a callback is issued.

</div>

## Communication from RP’s Node to AS’s Node

Now, it’s time to fetch the data from AS.

<div class="flash mb-3 flash-warn">
  @todo #2 Update the Background section to include this data in the setup.
</div>

RP node looks up the `node_id` corresponding to the service in the blockchain:

| as_id | as_service_id | node_id |
| --- | --- | --- |
| AS1 | bank_statement | <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> |

Again, we look up the public key corresponding to this node from the blockchain:

| node_id | public_key |
| --- | --- |
| <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQD+AS+n0IWKC… |

It encrypts the following the message and sends it to the AS’ node via message queue. (Note: No data stored in blockchain in request phase.)

```yml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
namespace: 'citizen_id'
identifier: '01234567890123'
rp_node_id: <node id of relying party>
service_data_request_list: [{
  service_id: 'bank_statement',
  request_params: { format: 'pdf' },
  request_params_salt: '<random>'
}]
request_message: 'ขอ Bank statement เพื่อทำ VISA ที่สถานฑูตลาว'
request_message_salt: '<random>'
response_private_data_list: [{
  idp_id: 'idp node id',
  accessor_id: '<some_id>'
}]
```

## Platform&rarr;AS: [POST /service/bank_statement](https://app.swaggerhub.com/apis/NDID/as_callback/3.0#/default/data_request)

Now, AS Node received a data request through the message queue. It then looks up the request and consent transactions with matching `request_id` in the blockchain.

* Verify that (number of consent ≥ min_idp in request).
* For each consent with matching request ID:
  * Verify the signature.
  * Verify that the `request_params_hash` is matching with the request.
  * Verify all signatures from IdP

Then it sends the API call to the AS through the registered callback URL.

```yaml
namespace: 'citizen_id'
identifier: '01234567890123'
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
mode: 2
service_id: 'bank_statement'
requester_node_id: 'RP_06626-b9c7-4c52-abf2-019220637c91'
request_params: { format: 'pdf' }

# An array because signature may come from different IdPs.
response_signature_list: [
  '<signature>'
]

# The IAL and AAL. In case of multiple IdPs, take the maximum.
max_ial: 2.1
max_aal: 3
request_timeout: 259200
```

## AS&rarr;Platform

The AS replies synchronously with the requested data:

```yaml
data: '<PDF BINARY DATA>'
```

AS node encrypts the response and sends it back to RP via message queue.

AS node adds transaction to blockchain:

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
service_id: 'bank_statement'
signature: sign(<PDF BINARY DATA> | salt, AS1’s private key)
```

## Platform&rarr;RP

RP node receives the data via message queue and verifies signature in blockchain.
RP node updates the request status and call callback to RP.

## Retrieving data: [GET /rp/request_data/ef6f4c9c-818b-…](https://app.swaggerhub.com/apis/NDID/relying_party_api/3.0#/default/get_request_data)

Finally, RP calls the API to retrieve the request data.
It returns with:

```yaml
source_node_id: AS1 
service_id: bank_statement
source_signature: sign(<PDF BINARY DATA> | salt, AS1’s private key)
data: '<PDF BINARY DATA>'
data_salt: '<random>'
```

Now, RP has all the necessary data to process the transaction!
