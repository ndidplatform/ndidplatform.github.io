---
id: api-ndid
title: API (NDID)
sidebar_label: NDID
---

API specific to NDID role

## POST `/ndid/init_ndid`

Initialize blockchain with public keys (node key and master node key) of NDID node.

#### Body Parameters

| Property               | Type   | Required | Description                                                                |
| ---------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| public_key             | string | true     | Node public key                                                            |
| public_key_type        | string |          | Key type of `public_key`. Allowed value is `RSA`.                          |
| master_public_key      | string | true     | Node master public key                                                     |
| master_public_key_type | string |          | Key type of `master_public_key`. Allowed value is `RSA`.                   |
| chain_history_info     | string |          | Arbitrary string containing information of previous chains from migration. |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/end_init`

Call when initialization is done (e.g. after set initial data to blockchain on chain migration).

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/register_node`

Register a new node to the platform.

#### Body Parameters

| Property             | Type   | Required | Description                                                                              |
| -------------------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| node_id              | string | true     | Node ID                                                                                  |
| node_name            | string | true     | Node name                                                                                |
| node_key             | string | true     | Node public key                                                                          |
| node_key_type        | string |          | Key type of `public_key`. Allowed value is `RSA`.                                        |
| node_master_key      | string | true     | Node master public key                                                                   |
| node_master_key_type | string |          | Key type of `master_public_key`. Allowed value is `RSA`.                                 |
| role                 | string | true     | Allowed values are `rp`, `idp`, `as`, and `proxy`                                        |
| max_aal              | number |          | For IdP nodes only. Allowed values are `1`, `2.1`, `2.2`, and `3`                        |
| max_ial              | number |          | For IdP nodes only. Allowed values are `1.1`, `1.2`, `1.3`, `2.1`, `2.2`, `2.3`, and `3` |

#### Success Response

HTTP Status: 201 Created

## POST `/ndid/update_node`

Update node's properties on the platform. Currently use for updating IdP node's `max_ial` and `max_aal`.

#### Body Parameters

| Property  | Type   | Required | Description                                                                              |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| node_id   | string | true     | Node ID                                                                                  |
| node_name | string |          | Node name                                                                                |
| max_aal   | number |          | For IdP nodes only. Allowed values are `1`, `2.1`, `2.2`, and `3`                        |
| max_ial   | number |          | For IdP nodes only. Allowed values are `1.1`, `1.2`, `1.3`, `2.1`, `2.2`, `2.3`, and `3` |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/enable_node`

Re-enable node to make transactions.

#### Body Parameters

| Property | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| node_id  | string | true     | Node ID     |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/disable_node`

Disable node from making transactions and remove node from results of multiple query APIs.

#### Body Parameters

| Property | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| node_id  | string | true     | Node ID     |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/set_node_token`

Set node token.

#### Body Parameters

| Property | Type   | Required | Description            |
| -------- | ------ | -------- | ---------------------- |
| node_id  | string | true     | Node ID                |
| amount   | number | true     | Amount of token to set |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/add_node_token`

Add node token.

#### Body Parameters

| Property | Type   | Required | Description            |
| -------- | ------ | -------- | ---------------------- |
| node_id  | string | true     | Node ID                |
| amount   | number | true     | Amount of token to add |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/reduce_node_token`

Reduce node token.

#### Body Parameters

| Property | Type   | Required | Description               |
| -------- | ------ | -------- | ------------------------- |
| node_id  | string | true     | Node ID                   |
| amount   | number | true     | Amount of token to deduct |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/set_allowed_mode_list`

Set allowed modes for create request.

#### Body Parameters

| Property          | Type   | Required | Description                                                       |
| ----------------- | ------ | -------- | ----------------------------------------------------------------- |
| purpose           | string | true     | Request purpose                                                   |
| allowed_mode_list | array  | true     | Allowed modes. Allowed values in the array are `1`, `2`, and `3`. |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/create_namespace`

Create a new namespace to the platform.

#### Body Parameters

| Property                                           | Type   | Required | Description           |
| -------------------------------------------------- | ------ | -------- | --------------------- |
| namespace                                          | string | true     | Namespace             |
| description                                        | string |          | Namespace description |
| allowed_identifier_count_in_reference_group        | number |          |                       |
| allowed_active_identifier_count_in_reference_group | number |          |                       |

#### Success Response

HTTP Status: 201 Created

## POST `/ndid/update_namespace`

Update namespace's properties on the platform.

#### Body Parameters

| Property                                           | Type   | Required | Description           |
| -------------------------------------------------- | ------ | -------- | --------------------- |
| namespace                                          | string | true     | Namespace             |
| description                                        | string |          | Namespace description |
| allowed_identifier_count_in_reference_group        | number |          |                       |
| allowed_active_identifier_count_in_reference_group | number |          |                       |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/enable_namespace`

Make namespace on the platform usable.

#### Body Parameters

| Property  | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| namespace | string | true     | Namespace   |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/disable_namespace`

Make namespace on the platform unusable.

#### Body Parameters

| Property  | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| namespace | string | true     | Namespace   |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/create_service`

Create a new service to the platform.

#### Body Parameters

| Property     | Type   | Required | Description  |
| ------------ | ------ | -------- | ------------ |
| service_id   | string | true     | Service ID   |
| service_name | string | true     | Service name |

#### Success Response

HTTP Status: 201 Created

## POST `/ndid/update_service`

Update service's properties on the platform.

#### Body Parameters

| Property     | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| service_id   | string | true     | Service ID to update |
| service_name | string | true     | Service name         |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/enable_service`

Make a service on the platform usable.

#### Body Parameters

| Property   | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| service_id | string | true     | Service ID to enable |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/disable_service`

Make a service on the platform unusable.

#### Body Parameters

| Property   | Type   | Required | Description           |
| ---------- | ------ | -------- | --------------------- |
| service_id | string | true     | Service ID to disable |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/approve_service`

Approve AS node to provide a service on the platform.

#### Body Parameters

| Property   | Type   | Required | Description                             |
| ---------- | ------ | -------- | --------------------------------------- |
| node_id    | string | true     | Node ID                                 |
| service_id | string | true     | Service ID to approve for node to serve |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/enable_service_destination`

Re-enable approved AS service.

#### Body Parameters

| Property   | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| node_id    | string | true     | Node ID     |
| service_id | string | true     | Service ID  |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/disable_service_destination`

Disable approved AS service.

#### Body Parameters

| Property   | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| node_id    | string | true     | Node ID     |
| service_id | string | true     | Service ID  |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/add_node_to_proxy_node`

Add node to be a child of proxy node.

#### Body Parameters

| Property      | Type   | Required | Description                                                       |
| ------------- | ------ | -------- | ----------------------------------------------------------------- |
| node_id       | string | true     | Node ID to set as proxy node child                                |
| proxy_node_id | string | true     | Proxy node ID                                                     |
| config        | string | true     | Allowed values in the array are `KEY_ON_PROXY` and `KEY_ON_NODE`. |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/update_node_proxy_node`

Update a child node of proxy node specific properties.

#### Body Parameters

| Property      | Type   | Required | Description                                                       |
| ------------- | ------ | -------- | ----------------------------------------------------------------- |
| node_id       | string | true     | Node ID of proxy child node                                       |
| proxy_node_id | string | true     | Proxy node ID                                                     |
| config        | string |          | Allowed values in the array are `KEY_ON_PROXY` and `KEY_ON_NODE`. |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/remove_node_from_proxy_node`

Remove a child node from proxy node.

#### Body Parameters

| Property | Type   | Required | Description                           |
| -------- | ------ | -------- | ------------------------------------- |
| node_id  | string | true     | Node ID of proxy child node to remove |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/set_last_block`

Set last block height to process transactions. Transactions after set height will be errored and not processed by ABCI app.

#### Body Parameters

| Property     | Type   | Required | Description                               |
| ------------ | ------ | -------- | ----------------------------------------- |
| block_height | number | true     | Last block height to process transactions |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/get_allowed_min_ial_for_register_identity_at_first_idp`

Get allowed minimum IAL for registering/onboarding an user at first IdP.

#### Success Response

HTTP Status: 200 OK

| Property | Type   | Required | Description                                                          |
| -------- | ------ | -------- | -------------------------------------------------------------------- |
| min_ial  | number | true     | Posible values are `1.1`, `1.2`, `1.3`, `2.1`, `2.2`, `2.3`, and `3` |

**Example**

```json
{
  "min_ial": 2.1
}
```

## POST `/ndid/set_allowed_min_ial_for_register_identity_at_first_idp`

Set allowed minimum IAL for registering/onboarding an user at first IdP.

#### Body Parameters

| Property | Type   | Required | Description                                                          |
| -------- | ------ | -------- | -------------------------------------------------------------------- |
| min_ial  | number | true     | Allowed values are `1.1`, `1.2`, `1.3`, `2.1`, `2.2`, `2.3`, and `3` |

#### Success Response

HTTP Status: 204 No Content

## POST `/ndid/set_validator`

Set Tendermint node as validator node.

#### Body Parameters

| Property   | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| public_key | string | true     | Tendermint node public key |
| power      | number | true     | Validator power            |

#### Success Response

HTTP Status: 204 No Content
