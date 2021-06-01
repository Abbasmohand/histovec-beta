#!/bin/sh

# Run the following command to export the certificate: openssl pkcs12 -in histovec.pfx -nokeys -out histovec.pem
# Get the JWT token copying from log

curl -d '{"immat": "BY-361-JY"}' -H "Authorization: bearer <JWT_token>" -H "Accept: application/json, text/plain, */*" -H "Content-Type: application/json" -X POST https://histovectest.utac-otc.com/histovec/api/v1.0/immat/search -E src/utac/histovec.pem --cacert src/utac/utac.pem
