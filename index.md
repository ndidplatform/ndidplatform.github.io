---
title: NDID Platform
---

Development hub for Thailand National Digital ID platform.

| Title             | URL                                           |
| ----------------- | --------------------------------------------- |
| **Official site** | <http://www.digitalid.or.th/>                 |
| **Facebook page** | <https://www.facebook.com/NationalDigitalID/> |
| **Whitepaper**    | <https://goo.gl/v4Cfpe>                       |
| **Slack**         | <https://bit.ly/2GFWyIn>                      |

## Architecture overview

From the whitepaper:

> The Digital Identity Platform is intended to provide a flexible and highly
> secured method of self-identification for any Thai citizen personal. The
> platform must be able to leverage any reliable identity the user currently
> holds. Examples of reliable identity could be, for example, Citizen Id, Bank
> Accounts, Passport Number, Tax ID, Biometric Data.
>
> The users will interact with a **Relying Party (RP)** to receive services –
> offline or online. In order to successfully receive the services, the users
> are obliged to prove their identities in the form of online or offline
> identity confirmation with any available Identity Provider, aka. IDP who hold
> their identities.
>
> An Authoritative Source (AS) is considered as Source of Truth for any
> information relevant to the users. There are currently multiple Source of
> Truth entities. Each entity may keep one or multiple classification of user
> information. The RP can request more user information from AS, if necessary,
> under the permission granted by the users.

## Functional requirements

### Consent and data request flow

In this flow, a **User** wants to use the service provided by the **Relying
Party (RP)** which needs identification verification.

#### Scenario: Successful data request

```mermaid
sequenceDiagram
    participant User
    participant RP
    participant Platform
    participant IDP
    participant AS
    User->>RP: Use service
    RP->>User: Please provide ID
    User->>RP: 1-2345-67890-12-3
    Note over User,RP: Q1: What is the format of an ID?
    RP->>+Platform: send_data_request_to_id_at_idp_async
    Note over RP,Platform: Q2: Is this an SDK function call? How do RP communicate with the platform? HTTP API or via message bus?
    Platform-->>-RP: request_id
    Platform-->>IDP: authentication_request
    IDP->>User: Authentication/consent request
    User-->>IDP: Accept
    Note over Platform,IDP: Q3: This looks like a synchronous call. Since a consent may take a long time, should it be asynchronous? If so, should IDP tell the platform, or should the platform poll the IDP for response?
    IDP-->>Platform: confirm
    Platform->>RP: (callback)
    Note over RP,Platform: Q4: In the whitepaper, RP does not have a callback URL. Should the RP implement a callback URL (like OAuth) or should RP poll for status (using check_request_status)? In case of callback, why not send the status along with callback?
    RP->>+Platform: check_request_status
    Platform-->>-RP: complete
    Note over RP,Platform: Q5: In the whitepaper, there is ‘confirmed’ and ‘completed’ status code. What are the differences between the two?
    Platform->>+AS: service_id
    AS-->>-Platform: Data response
    Platform->>RP: (callback)
    RP->>+Platform: get_request_data
    Platform-->>-RP: data_list
```

#### Questions:

- Q6: What data is stored on blockchain.
- Q7: Which part is HTTP API? Which part is sent through message bus?
