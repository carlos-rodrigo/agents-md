#!/bin/bash
set -euo pipefail

# Run dumb-zone extension tests
cd /Users/carlosrodrigo/Developer/pi-config
bash scripts/verify.sh "$@"
