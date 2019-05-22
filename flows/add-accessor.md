---
title: Add Accessor
---

# Add Accessor Flows

## Mode 2

```mermaid
sequenceDiagram
    participant IdP
    participant Platform
    IdP->>+Platform: POST /identity/<namespace>/<identifier>/accessors
    Platform-->>IdP: 202
    Platform->>-IdP: Callback, add accessor result, success=true
    Platform->>IdP 1: Callback, notify identity modification
```

## Mode 3

```mermaid
sequenceDiagram
    participant User
    participant IdP 1
    participant Platform
    participant IdP 2
    IdP 1->>+Platform: POST /identity/<namespace>/<identifier>/accessors
    Platform-->>IdP 1: 202
    Note over IdP 1,IdP 2: Create a consent request and send to all IdPs that has onboarded this identity including self. IdP 2 may be the node that responses to consent request.
    Platform->>-IdP 1: Callback, add accessor request result, request_id=b7ea981e...
    Platform->>+IdP 1: /idp/request, request_id=b7ea981e...
    IdP 1-->>-Platform: 204, Acknowledged
    IdP 1->>User: Asks user to authenticate
    User-->>IdP 1: Accepts the consent request
    IdP 1->>+Platform: /idp/response
    Platform-->>IdP 1: 202
    Platform->>+IdP 1: Callback accessor encrypt
    IdP 1-->>-Platform: 200, signature=<base64_string>
    Platform->>-IdP 1: Callback, response result
    Platform->>IdP 1: Callback, add accessor result, success=true
    Platform->>IdP 2: Callback, notify identity modification
```
