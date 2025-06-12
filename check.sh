#!/bin/bash

CONTRACT=0x7fE8a1cA9913cEe5Ba0B3BfCEED61d83570892Fc
SENDER=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

ROLE=$(cast call $CONTRACT "SET_TREE_ROLE()")

echo "$ROLE"

cast rpc anvil_impersonateAccount "$SENDER"
cast send "$CSM" "grantRole(bytes32,address)" "$ROLE" "$ADMIN" --from "$ADMIN" --unlocked
cast send "$CSM" "resume()" --from "$ADMIN" --unlocked

cast call $CSM "isPaused()(bool)"

# hoodi
# just deploy-impl-live --account 222 --sender 0x8c92472e51efcf126f5bdbc39d7023b95c746c95 --password=""
