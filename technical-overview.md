---
title: Technical overview
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
  - Communicates securely with other nodes through NSQ.

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

- When an NDID Node joins the platform, they have to advertise their service.
  This data will go into the blockchain:

  <div class="flash mb-3 flash-warn">
    @todo #2 Also give a name to each of these mappings.
  </div>

  - **node_id → public_key mapping** to allow secure private data communication via NSQ.

    | node\_id | public\_key |
    | --- | --- |
    | <x-guid>RP_06626-b9c7-4c52-abf2-019220637c91</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+RP+svJPfe… |
    | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+IdP+lk1ax… |
    | <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQD+AS+n0IWKC… |

- **IDP Enrolment/Onboarding:** The User must have their identities registered with an IdP (through an “enrolment” process).
  Check out the flow [in the whitepaper](https://docs.google.com/document/d/1R48Vr5xeLQdq2AvdHKpSClUinWzykKB2Nfh_G9z3pvM/edit#heading=h.fw1fc2xwjef7).

  First, the user has to apply to enrol with the IdP.
  The IdP will verify the applicant’s identity (identity proofing).
  If the identity proofing process is very strict,
  the registered identity will have a high **IAL (Identity Assurance Level)**.

  In this scenario, the user onboarded with the IDP using his **citizen ID, 1-2345-67890-12-3**.

  - **How identity data is stored:** Some parts of data related to each identity is stored privately by each participating party, while others are on the blockchain.

    > ![Identity data](images/identity-data.png)

  - The IDP holds this data privately:

    | namespace | id | secret | accessor\_id | accessor\_private\_key |
    | --- | --- | --- | --- | --- |
    | citizenid | 1234567890123 | (magic) | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | <x-pk>-----BEGIN RSA PRIVATE KEY-----<br />MIIEowIBAAKCAQEAxy/CSXWu...</x-pk> |

  - These data are stored on the blockchain:

    <div class="flash mb-3 flash-warn">
      @todo #2 Give a name to each of these mappings.
    </div>

    - **hash({ns}/{id}) → node_id mapping** for sending message to IDP without sacrificing privacy.

      | hash({ns}/{id}) | node\_id |
      | --- | --- |
      | hash('citizenid/1234567890123') | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> |

    - **Accessor method** to allow zero-knowledge proof of consent:

      | accessor\_id | accessor\_type | accessor\_key | commitment |
      | --- | --- | --- | --- |
      | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | RSA-2048 | AAAAB3NzaC1yc2EAAAADAQABAAAB… | (magic) |

Given these data, let’s proceed with the scenario.

<div markdown="1" class="flash mb-3">

**Note:** The request body is written in a format similar to YAML, for ease of reading.

</div>

## RP&rarr;Platform: [POST /rp/requests/citizenid/01234567890123](https://app.swaggerhub.com/apis/ndid/relying_party_api/0.1#/default/send_request_to_id)

```yaml
# Reference ID is used in case of communication error between RP and platform,
# to prevent the same request from being executed twice.
reference_id: 'e3cb44c9-8848-4dec-98c8-8083f373b1f7'

# List of IdPs. May be empty to allow any IdP.
idp_list: []

# Synchronous mode:
# true - Wait until transaction is finished before returning.
# false - Return immediately with `request_id`.
synchronous: false

# If provided, this URL will be invoked when request status is updated.
# @todo #2 The word “callback” is usually a single word.
#  But in SwaggerHub the spec uses `call_back_url`.
#  Should this param be named `callback_url` instead?
#  Resolve the discrepancy between SwaggerHub and this doc.
call_back_url: 'https://<rp-webservice>/webhook'

# List of data to request from AS.
# This can be empty.
# @todo #2 In SwaggerHub this is called `as_service_list` with
#  slightly different parameter names and an extra parameter `count`.
#  Also, `as_id` is an array in SwaggerHub.
#  But since we may send different requests of different params to different AS.
#  We also may send multiple requests with different params to a same AS.
#  Resolve the discrepancy between SwaggerHub and this doc.
# @todo #2 In SwaggerHub there is `service_id_list`.
#  But we already have `as_service_list` which contains the same information.
#  Resolve the discrepancy between SwaggerHub and this doc.
data_request_list:
  # { service_id,       as_id, request_params }
  - { 'bank_statement', 'AS1', { format: 'pdf' } }

# Message to display to user to ask for consent.
# (RP must send message in correct language.)
request_message: 'Please allow the embassy to access your bank statement for purpose of obtaining a Visa.'

# Identity Assurance Level. Assurance level of KYC process.
# Examples:
#   IAL1 = self-asserted. e.g. email/facebook account
#   IAL2 = rudimentary identity verification. e.g. copy of id card
#   IAL3 = more strict verification, utilizing biometric data
min_ial: 2

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
# @todo #2 In SwaggerHub this is called `request_timeout` and has unit of milliseconds.
#  But the word ‘request’ may refer to HTTP request and also authentication request.
#  Should we name it `transaction_timeout` instead?
#  Resolve the discrepancy between SwaggerHub and this doc.
timeout: 259200 # seconds = 3 days
```

The API validates the request, generates a request ID and returns a response:

```yaml
200 OK

request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
```

This `request_id` can be used to check the status of request through [GET /rp/requests/{request_id}](https://app.swaggerhub.com/apis/ndid/relying_party_api/0.1#/default/get_request_status) API.

The `reference_id` &rarr; `request_id` mapping is stored in the node’s local storage, in case of communication error, to make this request idempotent.

| reference_id | request_id |
| --- | --- |
| <x-guid>e3cb44c9-8848-4dec-98c8-8083f373b1f7</x-guid> | <x-guid>ef6f4c9c-818b-42b8-8904-3d97c4c520f6</x-guid> |

The information about the request is stored in the blockchain.

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
min_idp: 1
min_aal: 1
min_ial: 2
timeout: 259200
data_request_list:
    # { service_id,       as_id }
    - { 'bank_statement', 'AS1' }
message_hash: hash('Please allow...')

# Note: Neither {ns}/{id} not its hash is stored here.
#       We want to keep each transaction private.
#       Elsewise, one could brute-force to find a transaction of any ID.
```

## Communication from RP’s Node to IdP’s Node

The target node IDs are obtained.

| hash({ns}/{id}) | node\_id |
| --- | --- |
| hash('citizenid/1234567890123') | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> |

Then the corresponding public key is obtained.

| node\_id | public\_key |
| --- | --- |
| <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+IdP+lk1ax… |

Then a message is constructed, encrypted with the public key, and sent to the nodes through NSQ:

```yaml
namespace: 'citizenid'
identifier: '01234567890123'
# @todo #2 In SwaggerHub this is called `service_id_list`.
#  Discuss in issue #6 and resolve this discrepancy.
data_request_list:
  # { service_id,       as_id }
  - { 'bank_statement', 'AS1' }
request_message: 'Please allow...'
min_ial: 2
min_aal: 1
min_idp: 1
timeout: 259200
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
```

IDP Node receives the request message from NSQ and decrypts it.

It reads the request from the blockchain:

- Verify that the parameters (`min_idp`, `min_aal`, `min_ial`, `timeout`, `data_request_list`) matches.
- Verify that `hash(request_message) === message_hash`.
- Check with the blockchain if the request is still necessary. (Request may be fulfilled by another IdP, in case the user onboarded with multiple IdPs.)

## Platform&rarr;IdP: [POST /idp/request/citizenid/01234567890123](https://app.swaggerhub.com/apis/ndid/idp_callback/0.1#/default/request_for_authentication)

At this point, IDP Node has checked that the consent is still needed. It issues a webhook to IDP’s web service, passing the above message.

## IdP&rarr;User

IdP asks the user to:

- Verify their identity (authentication).
- Give consent to allow RP to access the data from AS (data access authorization).

The message from is shown to the user:<br />“Please allow the embassy to access your bank statement for purpose of obtaining a Visa.”

Different ways of authentication has different security level.
Authentication using PIN or username/password combination can be considered low security, while public-key authentication can be considered having higher security.
Authentication method that has higher security gets a higher **AAL (Authentication Assurance Level)**.

## User&rarr;IdP

In this example, the user gave IdP the consent.

## IdP&rarr;Platform: [POST /idp/response](https://app.swaggerhub.com/apis/ndid/identity_provider/0.1#/default/respond_to_request)

IdP retrieves the `secret`, `accessor_id` and `accessor_private_key from private storage.

| namespace | id | secret | accessor\_id | accessor\_private\_key |
| --- | --- | --- | --- | --- |
| citizenid | 1234567890123 | (magic) | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | <x-pk>-----BEGIN RSA PRIVATE KEY-----<br />MIIEowIBAAKCAQEAxy/CSXWu...</x-pk> |

It then generates a signature by signing the `request_message` with that private key.

- `<signature>` = `RSA256(request_message, accessor_private_key)`

<div class="flash mb-3 flash-warn">
  @todo #2 Should the message to be signed also include the user’s approval status?
   Otherwise, the signature for CONFIRM is identical to REJECT…
</div>

Then it sends the `secret` and `signature` to the `POST /idp/response` API.

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
namespace: 'citizenid'
identifier: '01234567890123'
# @todo #2 Should this be called `aal` instead?
#  Should this change, update the SwaggerHub as well.
loa: 3
secret: 'MAGIC'
status: 'accept'
signature: '<signature>'
accessor_id: 'acc_f328-53da-4d51-a927-3cc6d3ed3feb'
```

Before AS can give out the data (or before the RP can accept this confirmation), they must verify that the user has really given the required consent and this consent is recorded in the blockchain.

However, the blockchain does not contain any identity information. But somehow, we need to verify that the `request_id` really corresponds to the identity in question (zero-knowledge proof). Thus, a magic formula [algorithm TBD] is used to calculate the `identity_proof`, a very long number.

<div class="flash mb-3 flash-warn">
  @todo #2 How is the `identity_proof` calculated?
</div>

The ‘assertion’ is recorded in the blockchain:

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
aal: 3
ial: 2
status: 'accept'
signature: '<signature>'
accessor_id: '12a8f328-53da-4d51-a927-3cc6d3ed3feb'
identity_proof: <identity_proof>
```

## Platform&rarr;RP: [POST /idp/request/ef6f4c9c-818b-…](https://app.swaggerhub.com/apis/ndid/rp_callback/0.1#/default/request_for_authentication)

At this point, RP-Node sees the above transaction committed in the blockchain.
It knows that the authentication request has been approved.
(However, data has not arrived yet.)

It updates the request state and notifies the RP through callback URL (if provided).

<div markdown="1" class="flash mb-3">

**Note:** Every time request status is updated, a callback is issued (if provided).

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

It encrypts the following the message and sends it to the AS’ node via NSQ. (Note: No data stored in blockchain in request phase.)

```yml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
namespace: 'citizenid'
identifier: '01234567890123'
service_id: 'bank_statement'
rp_node_id: <node id of relying party>
request_message: 'ขอ Bank statement เพื่อทำ VISA ที่สถานฑูตลาว'
```

## Platform&rarr;AS: [POST /service/citizenid/01234567890123](https://app.swaggerhub.com/apis/ndid/as_callback/0.1#/default/get_service__namespace___identifier_)

Now, AS Node received a data request through the NSQ. It then looks up the request and consent transactions with matching `request_id` in the blockchain.

* Verify that (number of consent ≥ min_idp in request).
* For each consent with matching request ID:
  * Verify the identity proof.
  * Verify the signature.
  * Verify that the `message_hash` is matching with the request.

Then it sends the API call to the AS through the registered callback URL.

```yaml
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
request_params: { format: 'pdf' }

# An array because signature may come from different IdPs.
signatures: [
  '<signature>'
]

# The IAL and AAL. In case of multiple IdPs, take the maximum.
max_ial: 2
max_aal: 3
```

## AS&rarr;Platform

The AS replies synchronously with the requested data:

```yaml
data: '<PDF BINARY DATA>'
```

AS node encrypts the response and sends it back to RP via NSQ.

AS node adds transaction to blockchain:

```yaml
as_id: 'AS1'
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
signature: sign(<PDF BINARY DATA>, AS1’s private key)
```

## Platform&rarr;RP

RP node receives the data via NSQ and verifies signature in blockchain.
RP node updates the request status and call callback to RP.

## Retrieving data: [GET /rp/requests/data/ef6f4c9c-818b-…](https://app.swaggerhub.com/apis/ndid/relying_party_api/0.1#/default/get_request_data)

Finally, RP calls the API to retrieve the request data.
It returns with:

```yaml
- source_node_id: AS1 
  service_id: bank_statement
  source_signature: sign(<PDF BINARY DATA>, AS1’s private key)
  signature_type: "SHA256_RSA2048"
  data: '<PDF BINARY DATA>'
```

Now, RP has all the necessary data to process the transaction!
