---
title: Create Identity / Onboarding
---

# Create Identity / Onboarding Flows

## Mode 2

### User has no identity on the platform - onboard as first IdP

```mermaid
sequenceDiagram
    participant User
    participant IdP
    participant Platform
    User->>IdP: KYC
    IdP->>+Platform: POST /identity
    Platform-->>IdP: 202
    opt Use external crypto
        Platform->>+IdP: Callback /node/sign
        IdP-->>-Platform: Signed Tx
    end
    Platform->>-IdP: Callback, create identity result, success=true
```

### User with identity on the platform

```mermaid
sequenceDiagram
    participant User
    participant IdP 2
    participant Platform
    participant Other IdPs
    User->>IdP 2: KYC
    IdP 2->>+Platform: POST /identity
    Platform-->>IdP 2: 202
    opt Use external crypto
        Platform->>+IdP 2: Callback /node/sign
        IdP 2-->>-Platform: Signed Tx
    end
    Platform->>-IdP 2: Callback, create identity result, success=true
    Platform->>Other IdPs: Callback, notify identity modification, action=create_identity
```

## Mode 3

### User has no identity on the platform - onboard as first IdP

Same as mode 2

### User with identity on the platform

```mermaid
sequenceDiagram
    participant User
    participant IdP 2
    participant Platform
    participant IdP 1
    participant Other IdPs
    User->>IdP 2: KYC
    IdP 2->>+Platform: POST /identity
    Platform-->>IdP 2: 202
    Note over IdP 2,IdP 1: Since user has already onboarded at IdP 1, IdP 2 has to create a consent request to IdP 1.
    opt Use external crypto
        Platform->>+IdP 2: Callback /node/sign
        IdP 2-->>-Platform: Signed Tx
    end
    Platform->>-IdP 2: Callback, create identity request result, request_id=b7ea981e...
    Platform->>+IdP 1: /idp/request, request_id=b7ea981e...
    IdP 1-->>-Platform: 204, Acknowledged
    IdP 1->>User: Asks user to authenticate and allow IdP 2 to onboard user to the platform.
    User-->>IdP 1: Accepts the consent request
    IdP 1->>+Platform: /idp/response
    Platform-->>IdP 1: 202
    opt Use external crypto
        Platform->>+IdP 1: Callback /node/sign
        IdP 1-->>-Platform: Signed Tx
    end
    Platform->>+IdP 1: Callback accessor encrypt
    IdP 1-->>-Platform: 200, signature=<base64_string>
    Platform->>-IdP 1: Callback, response result
    opt Use external crypto
        Platform->>+IdP 2: Callback /node/sign
        IdP 2-->>-Platform: Signed Tx
    end
    Platform->>IdP 2: Callback, create identity result, success=true
    Platform->>IdP 1: Callback, notify identity modification, action=create_identity
    Platform->>Other IdPs: Callback, notify identity modification, action=create_identity
```
