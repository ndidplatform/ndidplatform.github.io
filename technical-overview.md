---
title: Technical overview
---

# Technical Overview

To be written.

For now here’s the (messy) meeting minute where we map out the scenario outlined in the [quick overview](/#quick-overview).

Sorry for the mess. This page should be cleaned up.

---

## **Scenario: ขอ Statement จาก 1 bank เพื่อขอ\*\***วีซ่า\*\*

**Background** Shared state in blockchain

Given 1 IDP, 1 RP, (3 AS [not pictured in table below]), user’s identity

**Shared state in blockchain [stored as transactions forever]:**

| Mapping                   | Purpose                    |
| ------------------------- | -------------------------- |
| node_id → public_key      | For communication via NSQ  |
| hash({ns}/{id}) → node_id | For sending message to IDP |
| { accessor_id, accessor_type, accessor_key, commitment }<br/>// Commitment is one ingredient for magic identity proof. | To allow zero-knowledge proof of consent. |

**IDP’s local data [as long as relevant]:**

| Mapping | Purpose |
| ------- | ------- |
| {ns}/{id} → { secret, accessor_id, accessor_private_key }<br/>// accessor_private_key may be on user side instead for increased security<br/>// accessor_private_key is RSA-2048. | For generating proof of consent. |

**User → Relying party**

เลขประจำตัวประชาชน

**RP → RP Node** **POST** /rp/requests/{namespace}/{identifier}

namespace = “citizenid” identifier = “01234567890123” (no dash) idp_list: [] #
Optional/empty = Any IDP is OK call_back_url:
'https://<rp-webservice>/webhook' # Leave out for polling/synchronous
synchronous: false # = Poll/Webhook

    data_request_list: # This can be empty for authentication-only mode
      # { service_id, as_id, request_params }
      - { 'bank_statement', 'AS1', { format: 'pdf' } }
      - { 'bank_statement', 'AS2', { format: 'pdf' } }
      - { 'location', 'AS3', { format: 'json', language: 'en' } }

    # RP must send message in correct language
    request_message: 'ขอ Bank statement เพื่อทำ VISA ที่สถานฑูตลาว'

    min_ial: 2 # Identity assurance level
      # Example:
      # 0 = email
      # 1 = สำเนาบัตร
      # 2 = e.g. โทรคุยกัน
      # 3 = Face-to-face

    min_aal: 1 # Authentication assurance level
      # Example:
      # 0 = bot / auto-approve?
      # 1 = username/password
      # 2 = multi-factor auth
      # 3 = public key

    min_idp: 1 # Minimum number of IDP
    timeout: 4320 # minutes = 3 days

    # RP runs a node (or rent a node).
    # The node takes care of signing the request.
    reference_id: 'e3cb44c9-8848-4dec-98c8-8083f373b1f7'

**Synchronous vs Asynchronous**

* Sync: Wait for operation to complete — platform keep HTTP request open until
  complete
* Async:
  * Polling (pull) — retry responsibility is at RP (caller)
  * Callback (push) — retry responsibility is at platform
  * Long polling (pull but platform can delay response until timeout)
* What should we offer?

**Timeout**

* Transaction timeout
* HTTP request timeout (for polling mode/synchronous)

**Service ID — Type of service provided (string)**

* Domain (Apple/Java) — th.or.digitalid.service.statement
  * **Problem:** Each AS may create its own proprietary service type, leading to
    fragmentation and painful standardization process.
* URL (XML Namespace) — https://service.digitalid.or.th/statement.html
  * The URL can display a documentation about service type.
* Numeric (00001 = statement)
* GUID
* String (built-in service ID, defined by NDID)
  * service_id: ‘bank_statement’

**AS ID — ID of authoritative service**

* TBD

**Request type**

* Authentication only: Don’t need extra data from AS
* Data consent: Need more data (e.g. personal data / verification data) from AS.

**Issue:**

* Idempotency — What if API die before sending response.
  * Can be solved by returning request ID before adding data to blockchain.
    * What about network error?
      * Solved by adding reference ID to the request and provide another API
        endpoint to map the reference ID back.
        * ref_id cannot solve every case.

---

**Input validation succeeded**

* Must also check if reference ID already exists, if so, return the result of
  that request.

**API Call return 200**

    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6' # UUID

**Store (reference ID → request ID) in node’s database**

* To allow idempotency. reference_id: 'e3cb44c9-8848-4dec-98c8-8083f373b1f7'
  request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'

**Create blockchain request**

    request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
    min_idp: 1
    min_aal: 1
    min_ial: 2
    timeout: 4320
    data_request_list:
      bank_statement: [ 'AS1', 'AS2' ]
      location: [ 'AS3' ]
    message_hash: hash('ขอ Bank statement เพื่อทำ VISA ที่สถานฑูตลาว') # SHA3 (TBD)
    # No namespace/identifier — this would enable brute-forcing.

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
