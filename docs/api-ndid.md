---
id: api-ndid
title: API (NDID)
sidebar_label: NDID
---

API specific to NDID role

## POST `/ndid/init_ndid`

Initialize blockchain with public keys (node key and master node key) of NDID node.

## POST `/ndid/end_init`

Call when initialization is done (e.g. after set initial data to blockchain on chain migration).

## POST `/ndid/register_node`

Register a new node to the platform.

## POST `/ndid/update_node`

Update node's properties on the platform. Currently use for updating IdP nodes' `max_ial` and `max_aal`.

## POST `/ndid/enable_node`

Re-enable node to make transactions.

## POST `/ndid/disable_node`

Disable node from making transactions and remove node from results of multiple query APIs.

## POST `/ndid/set_node_token`

Set node token.

## POST `/ndid/add_node_token`

Add node token.

## POST `/ndid/reduce_node_token`

Reduce node token.

## POST `/ndid/set_allowed_mode_list`

Set allowed modes for create request.

## POST `/ndid/create_namespace`

Create a new namespace to the platform.

## POST `/ndid/update_namespace`

Update namespace's properties on the platform.

## POST `/ndid/enable_namespace`

Make namespace on the platform usable.

## POST `/ndid/disable_namespace`

Make namespace on the platform unusable.

## POST `/ndid/create_service`

Create a new service to the platform.

## POST `/ndid/update_service`

Update service's properties on the platform.

## POST `/ndid/enable_service`

Make a service on the platform usable.

## POST `/ndid/disable_service`

Make a service on the platform unusable.

## POST `/ndid/approve_service`

Approve AS node to provide a service on the platform.

## POST `/ndid/enable_service_destination`

Re-enable approved AS service.

## POST `/ndid/disable_service_destination`

Disable approved AS service.

## POST `/ndid/add_node_to_proxy_node`

Add node to be a child of proxy node.

## POST `/ndid/update_node_proxy_node`

Update a child node of proxy node specific properties.

## POST `/ndid/remove_node_from_proxy_node`

Remove a child node from proxy node.

## POST `/ndid/set_last_block`

Set last block height to process transactions. Transactions after set height will be errored and not processed by ABCI app.

## POST `/ndid/get_allowed_min_ial_for_register_identity_at_first_idp`

Get allowed minimum IAL for registering/onboarding an user at first IdP.

## POST `/ndid/set_allowed_min_ial_for_register_identity_at_first_idp`

Set allowed minimum IAL for registering/onboarding an user at first IdP.

## POST `/ndid/set_validator`

Set Tendermint node as validator node.
