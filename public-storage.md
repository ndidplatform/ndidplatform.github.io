---
title: Public storage
---

# Public storage (Key-Value Store)

### ER Diagram

![Identity data](images/er-public-storage.png)

### MasterNDID &rarr; NDID’s node master key

  | Key | Value |
  | --- | --- |
  | MasterNDID | -----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg... |

### NodeID | node’s node ID &rarr; Node detail (JSON)

  | Key | Value |
  | --- | --- |
  | NodePublicKeyRole\|NDID | { <br> &emsp; "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9wOCAQ8...,<br> &emsp; "master_public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqCAQ...",<br> &emsp; "node_name": "NDID" <br> } |

### NodePublicKeyRole|node’s public key &rarr; Role eg. (NDID, RP, IdP, AS)

  | Key | Value |
  | --- | --- |
  | NodePublicKeyRole\|-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFA... | NDID |

### MaxIalAalNode|IdP node ID &rarr; Max IAL, AAL (JSON)

  | Key | Value |
  | --- | --- |
  | MaxIalAalNode\|IdP1 | {<br> &emsp;"max_ial": 3,<br> &emsp;"max_aal": 3<br>} |

### MsqAddress|node’s node ID &rarr; Ip, port (JSON)

  | Key | Value |
  | --- | --- |
  | MsqAddress\|IdP1 | {<br> &emsp;"ip": "192.168.3.99",<br> &emsp;"port": 8000<br>} |

### IdPList &rarr; List of IdP (JSON)

  | Key | Value |
  | --- | --- |
  | IdPList | [<br> &emsp;"IdP1",<br> &emsp;"IdP2"<br>]  |

### Token|node’s node ID &rarr; Token amount

  | Key | Value |
  | --- | --- |
  | Token\|RP1 | 100.0 |

### TokenPriceFunc|function name &rarr; Price of function

  | Key | Value |
  | --- | --- |
  | TokenPriceFunc\|CreateRequest | 10.0 |

### SpendGas|node’s node ID &rarr; List of spend token (JSON)

  | Key | Value |
  | --- | --- |
  | SpendGas\|RP1 |  [<br> &emsp;{<br> &emsp;&emsp;"method": "CreateRequest",<br> &emsp;&emsp;"price": 1,<br> &emsp;&emsp;"data" :"ef6f4c9c-818b-42b8-8904-3d97c4c520f6"<br> &emsp;},<br> &emsp;{<br> &emsp;&emsp;"method": "CloseRequest",<br> &emsp;&emsp;"price": 1,<br> &emsp;&emsp;"data": "ef6f4c9c-818b-42b8-8904-3d97c4c520f6"<br> &emsp;}<br>] |

### AllService &rarr; List of service (JSON)

  | Key | Value |
  | --- | --- |
  | AllService | [<br> &emsp;{<br> &emsp;&emsp;"service_id": "statement",<br> &emsp;&emsp;"service_name": "Bank statement"<br> &emsp;}<br>] |

### Service|service’s ID &rarr; Service detail (JSON)

  | Key | Value |
  | --- | --- |
  | Service\|statement | {<br> &emsp;"service_name": "Bank statement"<br>} |

### ServiceDestination|service’s ID &rarr; List of service destination (JSON)

  | Key | Value |
  | --- | --- |
  | Service\|statement | {<br> &emsp;"node": [<br> &emsp;&emsp;{<br> &emsp;&emsp;&emsp;"id": "AS1",<br> &emsp;&emsp;&emsp;"name": "AS1",<br> &emsp;&emsp;&emsp;"min_ial": 1.1,<br> &emsp;&emsp;&emsp;"min_aal": 1.2,<br> &emsp;&emsp;&emsp;"service_id": "statement"<br> &emsp;&emsp;}<br> &emsp;]<br>} |

### AllNamespace &rarr; List of namespace (JSON)

  | Key | Value |
  | --- | --- |
  | AllService | [<br> &emsp;{<br> &emsp;&emsp;"namespace": "CID",<br> &emsp;&emsp;"description": "Citizen ID"<br> &emsp;},<br> &emsp;{<br> &emsp;&emsp;"namespace": "Tel",<br> &emsp;&emsp;"description": "Tel number"<br> &emsp;}<br>] |

### MsqDestination|hash ID &rarr; List of msq destination (JSON)

  | Key | Value |
  | --- | --- |
  | MsqDestination\|ece8921066562be07...| [<br> &emsp;{<br> &emsp;&emsp;"ial": 3,<br> &emsp;&emsp;"node_id": "IdP1"<br> &emsp;}<br>] |

### Request|request ID &rarr; Request detail (JSON)

  | Key | Value |
  | --- | --- |
  | Request\|ef6f4c9c-818b... | {<br> &emsp;"request_id": "ef6f4c9c-818b-42b8-8904-3d97c4c520f6",<br> &emsp;"min_idp": 1,<br> &emsp;"min_aal": 3,<br> &emsp;"min_ial": 3,<br> &emsp;"request_timeout": 259200,<br> &emsp;"data_request_list": [<br> &emsp;&emsp;{<br> &emsp;&emsp;&emsp;"service_id": "statement",<br> &emsp;&emsp;&emsp;"as_id_list": [<br> &emsp;&emsp;&emsp;&emsp;"AS1",<br> &emsp;&emsp;&emsp;&emsp;"AS2"<br> &emsp;&emsp;&emsp;],<br> &emsp;&emsp;&emsp;"count": 1,<br> &emsp;&emsp;&emsp;"request_params_hash": "hash",<br> &emsp;&emsp;&emsp;"answered_as_id_list": [<br> &emsp;&emsp;&emsp;&emsp;"AS1"<br> &emsp;&emsp;&emsp;],<br> &emsp;&emsp;&emsp;"received_data_from_list": []<br> &emsp;&emsp;}<br> &emsp;],<br> &emsp;"request_message_hash": "hash('Please allow...')",<br> &emsp;"responses": [<br> &emsp;&emsp;{<br> &emsp;&emsp;&emsp;"request_id": "ef6f4c9c-818b-42b8-8904-3d97c4c520f6",<br> &emsp;&emsp;&emsp;"aal": 3,<br> &emsp;&emsp;&emsp;"ial": 3,<br> &emsp;&emsp;&emsp;"status": "accept",<br> &emsp;&emsp;&emsp;"signature": "signature",<br> &emsp;&emsp;&emsp;"identity_proof": "Magic",<br> &emsp;&emsp;&emsp;"private_proof_hash": "",<br> &emsp;&emsp;&emsp;"idp_id": "IdP1"<br> &emsp;&emsp;}<br> &emsp;],<br> &emsp;"closed": false,<br> &emsp;"timed_out": false,<br> &emsp;"can_add_accessor": false,<br> &emsp;"owner": "RP1"<br>} |

### SignData|signature &rarr; Signature of data from AS (JSON)

  | Key | Value |
  | --- | --- |
  | SignData\|e8921066562be0sadasd... | {<br> &emsp;"service_id": "statement",<br> &emsp;"request_id": "ef6f4c9c-818b-42b8-8904-3d97c4c520f6",<br> &emsp;"signature": "e8921066562be0sadasd..."<br>} |

### Accessor|accessor ID &rarr; Accessor detail (JSON)

  | Key | Value |
  | --- | --- |
  | Accessor\|42b8-8904-3sda320f6 | {<br> &emsp;"accessor_type": "RSA2048",<br> &emsp;"accessor_public_key": "-----BEGIN PUBLIC KEY-----\nMIIBE...",<br> &emsp;"accessor_group_id": "3sda3sdAc4c520f6"<br>} |

### AccessorGroup|accessor group ID &rarr; Accessor group ID

  | Key | Value |
  | --- | --- |
  | AccessorGroup\|3sda3sdAc4c520f6 | 3sda3sdAc4c520f6 |