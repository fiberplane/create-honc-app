#! /bin/bash

# Returns paths to all files whose content contains "hono"
grep -ril "hono" ./cloudflare-docs/dist --exclude-dir=node_modules