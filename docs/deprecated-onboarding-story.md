---
id: onboarding-story
title: Onboarding Story
---

> **Disclaimer:** The purpose of this page is to illustrate the Onboarding scenario outlined in the [quick overview](/#quick-overview) using concrete examples, to help make it easier to grasp how the platform works. This document is **not** the definitive source of information, just a learning aid. Please look at the [whitepaper](https://docs.google.com/document/d/1SKydNM-Nyox62m3vuvYgFYCr8ABVQV8RhjwiMjdCpQ8/edit#heading=h.qf2lmu8vfgym) for the full description of the platform.

```yaml 
# Reference ID is used in case of communication error between IdP and platform,
# to prevent the same request from being executed twice.
reference_id: "e3cb44c9-8848-4dec-98c8-8083f373b1f7"

#The namespace of the ID (i.e. ID Card, Passport, etc)
namespace: "citizenid"


#Identifier : The unique identifier under the namespace (i.e. ID Card Number, Passport Number, etc). 
#The list of {namespace, Identifier} pair can be grouped together to identify an individual.
identifier: "1234567890123"


#Accessor method to allow zero-knowledge proof of consent
# 1 device 1 accessor value
# accessor_id > index of accessor_key > local ?
# accessor_key is a public key of the user
#Example
accessor_type: "RSA-2048"
accessor_key: "AAAAB3NzaC1yc2EAAAADAQABAAAB…"
accessor_id: "acc_f328-53da-4d51-a927-3cc6d3ed3feb"

# Identity Assurance Level. Assurance level of KYC process.
# Currently [as of May 2018]:
#   IAL1 = minimal proof of identity = weak identity verification e.g. copy of id card
#   IAL2.1-2.3 = Stronger identity verification with option to verify biometric data as a tougher measure
#   IAL3 = Strongest identity assurance level requiring more than one identification documents and biometric comparison is compulsary
ial: "2.3"

```

## Scenario#1 : Onboarding new identity 
![NDID Node](/img/onboarding-identity.png)

- IdP→Platform : POST: /identity(body) 
```yaml 
{   
  "reference_number":"123456789",
  "namespace": "citizenid",
  "identifier": "1234567890123",
  "accessor_type": "RSA-2048",
  "accessor_key": "AAAAB3NzaC1yc2EAAAADAQABAAAB…",
  "accessor_id": "acc_f328-53da-4d51-a927-3cc6d3ed3feb",
  "ial": "2.3"
}
```
The API validates the request, generates a request ID and returns a response:
```yaml
200 OK 
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
exist: boolean; false if you are the first IdP to onboard this user
secret: '<secret-calculated-by-platform>'
```

- response code
```yaml
200  Successful: return request_id
400  Error: Invalid accessor method or accessor value
```

 - This request_id can be used to check the status of request through [GET /identity/requests/{request_id}](https://app.swaggerhub.com/apis/ndid/identity/1.0#/default/get_request_status) API.
 

 - **IdP** will check if ns/id exists before onboarding new identity, if existed **IdP** triggers the request for user consent.
 - After obtaining user consent, **IdP** will process onboarding or reject identity addition, and respond through same IdP callback url API, but with `type: onboard_request`. 


## Scenario#2 : Adding new accessor
![NDID Node](/img/add-new-accessor.png)

- IdP->Platform : POST /identity/citizenid/1234567890123/accessors
```yaml
{
  "accessor_type": "RSA-2048",
  "accessor_key": "AAAAB3NzaC1yc2EAAAADAQABAAAB…",
  "accessor_id": "acc_f328-53da-4d51-a927-3cc6d3ed3feb"
}
```

- The API validates the request, generates a request ID and returns a response:
```yaml
200 OK 
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
```

- response code
```yaml
200  Successful: return request_id
202 "request_id" Request Accepted – Async processing, please check back or wait for response at Callback URL
400  Error: Invalid accessor type
403  Error: Identity does not exist
```
- After obtaining user consent, IdP can add new accessor to {namespace,identifier}. It will however return fail if this IdP does not associated with {namespace,identifier}.
Respond will be send through same IdP callback url API, but with `type: onboard_request`.

**POST /identity/request/ef6f4c9c-818b-42b8-8904-3d97c4c520f6**
```yaml 
*response code*
201 Status Create/Update Accepted
400 Status User reject
408 Status Timeout
```


## Scenario#3 : Adding new identifier (NOT SUPPORT IN PHASE 1)
![NDID Node](/img/add-new-identifier.png)


- IdP/RP/AS->Platform : POST /identity/{namespace}/{identifier}
```yaml
{
"identifiers": [
    "passport|AA123456789","mobile|0831111111"
  ]
}
```

- The API validates the request, generates a request ID and returns a response:
```yaml
200 OK 
request_id: 'ef6f4c9c-818b-42b8-8904-3d97c4c520f6'
```

- response code
```yaml
200  Successful: return request_id
202 "request_id" Request Accepted – Async processing, please check back or wait for response at Callback URL
400  Error: Invalid endorsement type
404  Error: Identity does not exist
```
- After obtaining user consent, IdP can add the new namespace and identifier. This scenario will fail if {namespace,identifier} does not exist at callback url [POST /identity/request/{identifier}] API. 

**POST /identity/request/ef6f4c9c-818b-42b8-8904-3d97c4c520f6**
```yaml 
*response code*
201 Status Create/Update Accepted
400 Status User reject
408 Status Timeout
```
<div class="flash mb-3 flash-warn">
  @todo #1 which organization should have the rights authority to add new namespace?
</div>


