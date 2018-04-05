---
title: Technical overview
---

# Technical Overview

<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** The purpose of this page is to illustrate the scenario outlined in the [quick overview](/#quick-overview) using concrete examples, to help make it easier to grasp how the platform works. This document is **not** the definitive source of information, just a learning aid. Please look at the [whitepaper](https://docs.google.com/document/d/1SKydNM-Nyox62m3vuvYgFYCr8ABVQV8RhjwiMjdCpQ8/edit#heading=h.qf2lmu8vfgym) for the full description of the platform.

</div>

## Scenario: Requesting a bank statement for Visa application

In this scenario, the User is at an embassy to apply for a Visa.
The embassy is the **Relying Party (RP)** as they relies on NDID platform
to verify the user’s identity through an **Identity Provider (IdP)**
and retrieving the bank statement form the **Authoritative Source (AS)**, the bank.

### Background

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

  - **node_id → public_key mapping** to allow secure private data communication via NSQ.

    | node\_id | public\_key |
    | --- | --- |
    | <x-guid>RP_06626-b9c7-4c52-abf2-019220637c91</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+RP+svJPfe… |
    | <x-guid>IdP_f924-5069-4c6a-a4e4-134cd1a3d3d0</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQC+IdP+lk1ax… |
    | <x-guid>AS_12767-0030-4a73-9593-ffd6d010c63c</x-guid> | AAAAB3NzaC1yc2EAAAADAQABAAABAQD+AS+n0IWKC… |

- **IDP Onboarding:** The User must have their identities be registered with an IdP.
  Check out the flow [in the whitepaper](https://docs.google.com/document/d/1R48Vr5xeLQdq2AvdHKpSClUinWzykKB2Nfh_G9z3pvM/edit#heading=h.fw1fc2xwjef7).

  In this scenario, the user onboarded with the IDP using his **citizen ID, 1-2345-67890-12-3**.

  - **How identity data is stored:** Some parts of data related to each identity is stored privately by each participating party, while others are on the blockchain.

    > ![Identity data](images/identity-data.png)

  - The IDP holds this data privately:

    | namespace | id | secret | accessor\_id | accessor\_private\_key |
    | --- | --- | --- | --- | --- |
    | citizenid | 1234567890123 | (magic) | <x-guid>acc_f328-53da-4d51-a927-3cc6d3ed3feb</x-guid> | <x-pk>-----BEGIN RSA PRIVATE KEY-----<br />MIIEowIBAAKCAQEAxy/CSXWu...</x-pk> |

  - These data are stored on the blockchain:

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

### RP&rarr;Platform: [POST /rp/requests/citizenid/01234567890123](https://app.swaggerhub.com/apis/ndid/relying_party_api/0.1#/default/send_request_to_id)

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
call_back_url: 'https://<rp-webservice>/webhook'

# List of data to request from AS.
# This can be empty.
data_request_list:
    # { service_id,       as_id, request_params }
    - { 'bank_statement', 'AS',  { format: 'pdf' } }

# Message to display to user to ask for consent.
# (RP must send message in correct language.)
request_message: 'Please allow the embassy to access your bank statement for purpose of obtaining a Visa.'

# Identity assurance level. Assurance level of KYC process.
# Example:
#   0 = email
#   1 = copy of id card
#   2 = e.g. telephone call
#   3 = e.g. face-to-face
min_ial: 2

# Authentication assurance level. Assurance level of authentication process.
# Example:
#   0 = bot / auto-approve?
#   1 = username/password
#   2 = multi-factor auth
#   3 = identity owner signs the consent request with their private key
min_aal: 1

# Minimum number of IdP approvals for auth request to be confirmed.
min_idp: 1

# Transaction timeout.
timeout: 4320 # minutes = 3 days
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
timeout: 4320
data_request_list:
    # { service_id,       as_id }
    - { 'bank_statement', 'AS1' }
message_hash: hash('Please allow...')

# Note: Neither {ns}/{id} not its hash is stored here.
#       We want to keep each transaction private.
#       Elsewise, one could brute-force to find a transaction of any ID.
```

---

**This page is under construction...**

For now here’s the (messy) meeting minute where we map out the scenario outlined in the [quick overview](/#quick-overview). Sorry for the mess. This page should be cleaned up. [Contributions welcome!](https://github.com/ndidplatform/ndidplatform.github.io/edit/master/technical-overview.md).

---

**Every node (including RP) knows [hash({namespace}/{id}) → {node_id}]
mapping.**

* An IDP can declare multiple node IDs.
* RP (node) looks up the Node IDs from above table, and sends the message to
  every node ID found associated to that ID.
  * Concern: Since RP is a node, it also knows this mapping.

**Create messaging request to node_ids** Encrypt and send from Node to IDP
through NSQ (message queue)

    namespace = 'citizenid'
    identifier = '01234567890123'
    data_request_list: # This can be empty -- for authentication only
      bank_statement: [ 'AS1', 'AS2' ]
      location: [ 'AS3' ]
    request_message: 'ขอ Bank statement เพื่อทำ VISA ที่สถานฑูตลาว'
    min_ial: 2
    min_aal: 1
    min_idp: 1
    timeout: 4320
    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'

**IDP node receives request from NSQ and decrypts it.**

* IDP has to check with the blockchain if request is still necessary.
* If consent still needed, issue a webhook to IDP’s webservice (sending message
  above)

**IDP talks to user**

---

**User accepted**

**Aside:** For a successful authentication, IDP needs to sign a message using a
private key associated with the identity ({ns}/{id}). When onboarding, the
private key may be generated by the user (e.g. the user gives IDP the public
key, while they hold private key locally), or user can also allow the message to
be signed on behalf of IDP (using IDP’s own key). This data is known as
“accessor method” {accessor*id, accessor_type /* ECC / RSA / … \_/,
accessor_key}.

Assume user has these accessor method stored in blockchain (stored when onboard)

| **accessor_id**                      | **accessor_type** | **accessor_key [public key]** |
| ------------------------------------ | ----------------- | ----------------------------- |
| 12a8f328-53da-4d51-a927-3cc6d3ed3feb | RSA2048           | AAAAB3NzaC1yc2EAAAADAQABAAAB  |
| AQDHL8JJda7RVn5ZRqni03Uo5Ku8b…       |

**IDP calls the IDP API** **POST /idp/response**

    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
    namespace: 'citizenid'
    identifier: '01234567890123'

    # Unique value that only IDP knows.
    # When user on-board with IDP, it generates a secret.
    # 1 secret <==> 1 {ns}/{id}.
    secret: 'MAGIC'

    loa: 3

    # CONFIRM / REJECT
    approval: CONFIRM

    # When IDP onboards user, IDP adds “accessor method” to blockchain.
    #   { accessor_id, accessor_type, accessor_key }
    signature: '<RSA signature of signing the request_message(ขอ Bank statement...) with accessor type>'
    accessor_id: '12a8f328-53da-4d51-a927-3cc6d3ed3feb'

**API → Node**

Add a new transaction into blockchain, representing the response.

    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
    aal: 3
    ial: 2
    approval: CONFIRM
    signature: '<RSA signature of signing the message with accessor type>'
    accessor_id: '12a8f328-53da-4d51-a927-3cc6d3ed3feb'

    # AS will use this later....
    identity_proof: 0x---------------------------------
      # A very long number... Zero knowledge mathematical proof
      # that the “request_id” is associated with “{ns}/{id}”
      # (which will be sent separately through NSQ to AS)
      # and that the user already provided consent to IDP.
      #
      # [ { ns, id, secret } ] ---(magic)---> identity_proof
      #                           trapdoor
      # Algorithm TBD.

**RP-Node sees this transaction committed in the blockchain,** **updates the
request state and notifies the RP through callback URL (if provided)** // Every
time request status is updated, a callback is issued (if provided)

**At this point, RP knows that consent requirement is satisfied.**

---

## Data request

**RP node looks up ({as_service_id, as_id} → node_id) and encrypts & sends data
request to AS node via NSQ** (no data stored in blockchain in request phase)

    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
    namespace: 'citizenid'
    identifier: '01234567890123'
    service_id: 'bank_statement'
    rp_node_id: <node id of relying party>
    request_message: 'ขอ Bank statement เพื่อทำ VISA ที่สถานฑูตลาว'

**AS node** looks up the request and consent transactions with matching
request_id in the blockchain.

* Verify that (number of consent ≥ min_idp in request)
* For each consent with matching request ID
  * takes {ns,id,identity_proof} through magic function to verify that consent
    is authentic.
  * verifies that `hash(request_message) === request.message_hash`

**AS node sends callback to AS (synchronous)** **POST
/service/{namespace}/{identifier}**

namespace = “citizenid” identifier = “01234567890123” # required for e.g. letter
of guarantee request_params: { format: 'pdf' }

    # maybe from multiple IDPs
    signatures: [
      '<RSA signature of signing the request_message(ขอ Bank statement...) with accessor type>'
    ]
    max_ial: 2
    max_aal: 3

**AS replies synchronously**

    HTTP/1.1 200 OK

    <PDF BINARY DATA>

**AS node encrypts the response and sends it to RP via NSQ.** **AS node adds
transaction to blockchain**

    as_id: 'AS1'
    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
    signatures: sign(<PDF BINARY DATA>, AS1’s private key)

Data is in blockchain RP node receives the data via NSQ and verifies signature
in blockchain. RP node updates status and call callback to RP.
