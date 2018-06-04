---
title: Zero Knowledge Proof
---

We use [Guillou-Quisquater identity-based identification scheme](https://flylib.com/books/en/3.230.1.96/1/)

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

IDP now calculate `H = hash(sid)` with `SHA256` and find multiplicative inverse of `H` with modulo `N`, we will call this value `h`.
* h*H mod N = 1

Finding multiplicative inverse can be done efficiently using [extended Euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm) or example in Python can be found [here](https://stackoverflow.com/questions/4798654/modular-multiplicative-inverse-function-in-python)

Then IDP compute `secret` using following formula 
* secret = h<sup>d</sup> mod N

For first IDP, they also random `accessor_group_id` (also unique across platform). Others IDP must ask customer's associated-IDP for this value.

IDP keep `secret` secret, and keep a mapping from customer's `sid` to `secret`, `accessor_id`, `accessor_group_id`, and `accessor_private_key`.

Then provide these data to platform
```yaml
accessor_id: string
accessor_public_key: string ;in PEM format
accessor_group_id: string
``` 

### Note: 
* These process and calculations has reference implementation in our idp-client
* In blockchain `accessor_id` or `accessor_public_key` is NOT tie to any customer.

# Request creation

RP need to random string call `challenge` for each request and pass it along to IDP via message queue. These `challenge`, when convert to number, must not exceeds `public_key`.
It should be safe to random 512 bits string for 2048 bits key length for our platform.

# Identity proof creation

When IDP create response for their customer, they have to know `challenge` and generate another random for each response call `k`
which need to be smaller than `N`, it should be safe to random 512 bits for 2048 bits key length.

IDP then choose which `accessor_id` to use and calculate two proof, `identity_proof` which will store in blockchain, and `private_proof` which will send to RP via message queue.

* identity_proof = k<sup>e</sup> mod N
* private_proof = (k * secret<sup>challenge</sup>) mod N

`e` is public exponent derived from `accessor_public_key` corresspond to chosen `accessor_id`.

# Verifying proof

When RP receive all the proof they can verify if the proof is correspond to user by testing

* `identity_proof` = (H<sup>challenge</sup> * private_proof<sup>e</sup>) mod N

When `H` is hash of `sid` of customer.

If this equality holds, RP then proceeds to check that ALL `accessor_id` received from each IDP must map to the same `accessor_group_id`.

For AS to verify, RP must send `challenge` to AS to verify as well.

### NOTE: All calculation and process for zero-knowledge proof can be found in reference implementation