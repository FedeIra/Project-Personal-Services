#!/bin/sh
# Faros AI Word Cloud - Request Simulator (assignment script)
#
# Usage: ./simulateRequests.sh <SERVER> <PORT> <PARAM> <SLEEP_TIME> <EMAIL> <PASSWORD>
#
# Local example:
#   ./simulateRequests.sh http://localhost 3000/dev/wordcloud url 1 fedeirar@gmail.com mypassword
#
# AWS example:
#   ./simulateRequests.sh https://bk7xpquf2k.execute-api.us-east-2.amazonaws.com dev/wordcloud url 1 fedeirar@gmail.com mypassword

SERVER=$1
PORT=$2
PARAM=$3
SLEEP_TIME=$4
EMAIL=$5
PASSWORD=$6

# Extract base URL (only SERVER:PORT number, without path) for the login endpoint
BASE_PORT=$(echo "$PORT" | cut -d'/' -f1)
BASE_URL="$SERVER:$BASE_PORT"

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

curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCSOU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBFZNG" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00CBNIXHQ" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00HUGXOAU" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00KRMMCFM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TSUGXKE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00VVOCQHE" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00TRQPVKM" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
curl -X POST "$SERVER:$PORT?$PARAM=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" -H "Authorization: Bearer $TOKEN"
sleep $SLEEP_TIME
