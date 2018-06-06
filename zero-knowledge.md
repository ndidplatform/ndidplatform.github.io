---
title: Zero Knowledge Proof
---
<div markdown="1" class="flash mb-3 flash-warn">

**Disclaimer:** This document is currently different from reference implementation.
The reference implementation will be updated according to this document.

</div>

We use [Guillou-Quisquater identity-based identification scheme](https://flylib.com/books/en/3.230.1.96/1/) for zero-knowledge proof.

# Simple overview on RSA algorithm

Part of RSA key pair consist of
* `N`: modulo number
* `e`: public exponent number
* `d`: private exponent number

When we encrypt some string `S` with public key we actually compute cipher `C` by
* C = S<sup>e</sup> mod N

And when we decrypt cipher `C` with private key we actually compute orginal message `S` by
* S = C<sup>d</sup> mod N

For more information of [RSA-algorithm](https://en.wikipedia.org/wiki/RSA_(cryptosystem))

### Note: String can convert to number so we may use math operation on string, that mean we do operation to it when convert to number.

# Onboarding process

When IDP onboard new user with `namespace` and `identifier`, they have to generate a new RSA key pair with 2048 bits key and a random string to be `accessor_id` that has to be unique across platform.
We will call string `namespace:identifier` specific-ID or `sid`.

IDP now send `namespace` and `identifier` to platform.
Platform will calculate `H = hash(sid)` with `SHA256` and use registered callback url to IDP to encrypt.
This is the `secret` IDP need to keep along with the private key. 

The onboard API will automatically create request for consent (first IDP will generate request with `min_idp` = 0).

For first IDP, `ndid-api` will automatically random `accessor_group_id` (also unique across platform).
For others IDP onboard existing user, `ndid-api` will automatically retrieve this value and create request for consent to onboard.

This onboard API will return `request_id` along with `secret`.
IDP keep `secret` secret, and keep a mapping from customer's `sid` to `secret`, `accessor_id`, and `accessor_private_key` then provide these data to platform
```yaml
namespace: string
identifier: string
accessor_id: string
accessor_public_key: string ;in PEM format
``` 

Data that will be stored on blockchain is
```yaml
accessor_id: string
accessor_public_key: string ;in PEM format
accessor_group_id: string
``` 

### Note: 
* These process and calculations has reference implementation in our idp-client
* In blockchain `accessor_id` or `accessor_public_key` is NOT tie to any customer (but tie to `accessor_group_id`).

# Request creation

RP need to random string call `challenge` for each request and pass it along to IDP via message queue. These `challenge`, when convert to number, must not exceeds public exponent `e` (which is usually 65537 in openssl).

# Identity proof creation

When IDP create response for their customer, they have to know `challenge` and generate another random for each response call `k`
which need to be smaller than `N`, we use crypto random of size 2048 bits.

IDP then choose which `accessor_id` to use (according to `sid`) and calculate two proof, `identity_proof` which will store in blockchain, and `private_proof` which will send to RP via message queue.

* identity_proof = k<sup>e</sup> mod N
* private_proof = (k * secret<sup>challenge</sup>) mod N

`e` is public exponent derived from `accessor_public_key` corresspond to chosen `accessor_id`.

# Verifying proof

When RP receive all the proof they can verify if the proof is correspond to user by testing

* `identity_proof` = (H<sup>challenge</sup> * private_proof<sup>e</sup>) mod N

When `H` is the multiplicative inverse of hash of `sid` with modulo `N`. In other word, let `h` be hash of `sid`.
* (h*H) mod N = 1

Finding multiplicative inverse can be done efficiently using [extended Euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm) or example in Python can be found [here](https://stackoverflow.com/questions/4798654/modular-multiplicative-inverse-function-in-python)

If this equality holds, RP then proceeds to check that ALL `accessor_id` received from each IDP must map to the same `accessor_group_id`.

For AS to verify, RP must send `challenge` to AS to verify as well.

### NOTE
* All calculation and process for zero-knowledge proof can be found in reference implementation
* Blockchain is unaware of validity of zero-knowledge proof, hence, all response (valid or not) will be stored in blockchain.
It is RP's and/or AS's responsibility to verify the proof and act accordingly (which `ndid-api` automatically verify and notify the client with the result).
