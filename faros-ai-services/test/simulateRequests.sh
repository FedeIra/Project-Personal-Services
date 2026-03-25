#!/bin/sh
# Faros AI Word Cloud - Request Simulator (assignment script)
#
# Usage: ./simulateRequests.sh <PARAM> <SLEEP_TIME> <EMAIL> <PASSWORD>
#   Reads API_BASE_URL from .env (root of project)
#
# Local example:
#   API_BASE_URL=http://localhost:3000 ./simulateRequests.sh url 1 xxxx@gmail.com mypassword
#
# AWS example (API_BASE_URL set in .env):
#   ./simulateRequests.sh url 1 xxxx@gmail.com mypassword

# Load .env from project root if API_BASE_URL is not already set
if [ -z "$API_BASE_URL" ]; then
  ENV_FILE="$(dirname "$0")/../../.env"
  if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep 'API_BASE_URL' | xargs)
  fi
fi

if [ -z "$API_BASE_URL" ]; then
  echo "Error: API_BASE_URL is not set. Add it to .env or export it before running."
  exit 1
fi

PARAM=$1
SLEEP_TIME=$2
EMAIL=$3
PASSWORD=$4

BASE_URL="$API_BASE_URL"
ENDPOINT_URL="$API_BASE_URL/dev/wordcloud"

if [ -z "$TOKEN" ]; then
  echo "Authenticating..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/dev/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

  TOKEN=$(echo "$LOGIN_RESPONSE" | sed 's/.*"token":"\([^"]*\)".*/\1/')

  if [ -z "$TOKEN" ] || [ "$TOKEN" = "$LOGIN_RESPONSE" ]; then
    echo "Login failed: $LOGIN_RESPONSE"
    exit 1
  fi
  echo "Token obtained. Starting simulation..."
else
  echo "Using pre-set TOKEN. Starting simulation..."
fi

curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$ENDPOINT_URL?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
