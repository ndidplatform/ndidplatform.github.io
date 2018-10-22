---
title: Public storage
---

# Public storage (Key-Value Store)

### ER Diagram

![ER diagram](images/er-public-storage.png)

### \"MasterNDID\" &rarr; NDID’s node ID

  | Key | Value |
  | --- | --- |
  | MasterNDID | \<NDID’s node ID\> |

### \"NodeID\"|\<node’s node ID\> &rarr; Node detail (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | NodeID\|<node’s node ID\> | message NodeDetail { <br> &emsp; string public_key = 1; <br> &emsp; string master_public_key = 2; <br> &emsp; string node_name = 3; <br> &emsp;  string role = 4; <br> &emsp;  double max_ial = 5; <br> &emsp;  double max_aal = 6; <br> &emsp;  repeated MQ mq = 7; <br> &emsp;  bool active = 8; <br> } <br><br> message MQ { <br> &emsp;  string ip = 1; <br> &emsp; int64 port = 2; <br> } |

### \"allList\" &rarr; List of all node ID (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | allList | message AllList { <br> &emsp; repeated string node_id = 1; <br> } |

### \"rpList\" &rarr; List of RP node ID (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | rpList | message RPList { <br> &emsp; repeated string node_id = 1; <br> } |

### \"IdPList\" &rarr; List of IdP node ID (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | IdPList | message IdPList { <br> &emsp; repeated string node_id = 1; <br> } |

### \"asList\" &rarr; List of AS node ID (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | asList | message ASList { <br> &emsp; repeated string node_id = 1; <br> } |

### \"TimeOutBlockRegisterIdentity\" &rarr; Time out block for RegisterIdentity set by NDID

  | Key | Protobuf |
  | --- | --- |
  | TimeOutBlockRegisterIdentity | message TimeOutBlockRegisterIdentity { <br> &emsp; int64 time_out_block = 1; <br> } |

### \"Token\"|\<node’s node ID\> &rarr; Token amount

  | Key | Value |
  | --- | --- |
  | Token\|<node’s node ID> | 100.0 |

### \"TokenPriceFunc\"|\<function name\> &rarr; Price of function

  | Key | Value |
  | --- | --- |
  | TokenPriceFunc\|\<function name\> | 10.0 |

### \"SpendGas\"|\<node’s node ID\> &rarr; List of spend token (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | SpendGas\|\<node’s node ID\> | message ReportList { <br> &emsp; repeated Report reports = 1; <br> } <br><br> message Report { <br> &emsp; string method = 1; <br> &emsp; double price = 2; <br> &emsp; string data = 3; <br> } |

### \"AllService\" &rarr; List of service detail (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | AllService | message ServiceDetailList { <br> &emsp; repeated ServiceDetail services = 1; <br> } |

### \"Service\"|\<service’s ID\> &rarr; Service detail (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | Service\|\<service’s ID\> | message ServiceDetail { <br> &emsp; string service_id = 1; <br> &emsp; string service_name = 2; <br> &emsp; string data_schema = 3; <br> &emsp; string data_schema_version = 4; <br> &emsp; bool active = 5; <br> } |

### \"ApproveKey\"|\<service’s ID\>|\<node’s node ID\> &rarr; Approve value for regsiter service destination (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | ApproveKey\|\<service’s ID\>\|\<node’s node ID\> | message ApproveService { <br> &emsp; bool active = 1; <br> } |

### \"ProvideService\"|\<node’s node ID\> &rarr; Provide service list in AS node (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | ProvideService\|\<node’s node ID\> | message ServiceList { <br> &emsp; repeated Service services = 1; <br> } <br><br> message Service { <br> &emsp; string service_id = 1; <br> &emsp; double min_ial = 2; <br> &emsp; double min_aal = 3; <br> &emsp; bool active = 4; <br> &emsp; bool suspended = 5; <br> } |

### \"ServiceDestination\"|\<service’s ID\> &rarr; List of service destination (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | ServiceDestination\|\<service’s ID\> | message ServiceDesList { <br> &emsp; repeated ASNode node = 1; <br> } <br><br> message ASNode { <br> &emsp; string node_id = 1; <br> &emsp; double min_ial = 2; <br> &emsp; double min_aal = 3; <br> &emsp; string service_id = 4; <br> &emsp; bool active = 5; <br> } |

### \"AllNamespace\" &rarr; List of namespace (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | AllNamespace | message NamespaceList { <br> &emsp; repeated Namespace namespaces = 1; <br> } <br><br> message Namespace { <br> &emsp; string namespace = 1; <br> &emsp; string description = 2; <br> &emsp; bool active = 3; <br> } |

### \"MsqDestination\"|\<hash ID\> &rarr; List of msq destination (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | MsqDestination\|\<hash ID\> | message MsqDesList { <br> &emsp; repeated Node nodes = 1; <br> } <br><br> message Node { <br> &emsp; double ial = 1; <br> &emsp; string node_id = 2; <br> &emsp; bool active = 3; <br> &emsp; bool first = 4; <br> &emsp; int64 timeout_block = 5; <br> } |

### \"Request\"|\<request ID\> &rarr; Request detail (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | Request\|\<request ID\> | message Request { <br> &emsp; string request_id = 1; <br> &emsp; int64 min_idp = 2; <br> &emsp; double min_aal = 3; <br> &emsp; double min_ial = 4; <br> &emsp; int64 request_timeout = 5; <br> &emsp; repeated string idp_id_list = 6; <br> &emsp; repeated DataRequest data_request_list = 7; <br> &emsp; string request_message_hash = 8; <br> &emsp; repeated Response response_list = 9; <br> &emsp; bool closed = 10; <br> &emsp; bool timed_out = 11; <br> &emsp; string purpose = 12; <br> &emsp; string owner = 13; <br> &emsp; int64 mode = 14; <br> &emsp; int64 use_count = 15; <br> &emsp; int64 creation_block_height = 16; <br> } <br><br> message DataRequest { <br> &emsp; string service_id = 1; <br> &emsp; repeated string as_id_list = 2; <br> &emsp; int64 min_as = 3; <br> &emsp; string request_params_hash = 4; <br> &emsp; repeated string answered_as_id_list = 5; <br> &emsp; repeated string received_data_from_list = 6; <br> } <br><br> message Response { <br> &emsp; double ial = 1; <br> &emsp; double aal = 2; <br> &emsp; string status = 3; <br> &emsp; string signature = 4; <br> &emsp; string identity_proof = 5; <br> &emsp; string private_proof_hash = 6; <br> &emsp; string idp_id = 7; <br> &emsp; string valid_proof = 8; <br> &emsp; string valid_ial = 9; <br> &emsp; string valid_signature = 10; <br> } |

### \"SignData\"|\<node ID\>|\<service ID\>|\<request ID\> &rarr; Signature of data from AS

  | Key | Value |
  | --- | --- |
  | SignData\|AS1\|statement\|ef6f4c9c-818b-42b8-8904-3d97c4c520f6 | e8921066562be0sadasd... |

### \"AccessorGroup\"|\<accessor group ID\> &rarr; Accessor group ID

  | Key | Value |
  | --- | --- |
  | AccessorGroup\|\<accessor group ID\> | \<accessor group ID\> |

### \"Accessor\"|\<accessor ID\> &rarr; Accessor detail (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | Accessor\|\<accessor ID\> | message Accessor { <br> &emsp; string accessor_type = 1; <br> &emsp; string accessor_public_key = 2; <br> &emsp; string accessor_group_id = 3; <br> &emsp; bool active = 4; <br> &emsp; string owner = 5; <br> } |

### \"AccessorInGroup\"|\<accessor group ID\> &rarr; List of accessor ID in Accessor group (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | AccessorInGroup\|\<accessor group ID\> | message AccessorInGroup { <br> &emsp; repeated string accessors = 1; <br> } |

### \"Proxy\"|\<node’s node ID\> &rarr; Proxy of node (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | Proxy\|\<node’s node ID\> | message Proxy { <br> &emsp; string proxy_node_id = 1; <br> &emsp; string config = 2; <br> } |

### \"BehindProxyNode\"|\<proxy node’s node ID\> &rarr; List of node ID behind proxy (Protobuf)

  | Key | Protobuf |
  | --- | --- |
  | BehindProxyNode\|\<proxy node’s node ID\> | message BehindNodeList { <br> &emsp; repeated string nodes = 1; <br> } |