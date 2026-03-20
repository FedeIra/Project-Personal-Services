#!/bin/bash
# Faros AI Word Cloud - Request Simulator
# Usage: ./simulateRequests.sh [host] [port] [delay_seconds]
#
# Example: ./simulateRequests.sh localhost 3000 1

HOST=${1:-localhost}
PORT=${2:-3000}
DELAY=${3:-1}

BASE_URL="http://${HOST}:${PORT}"

# Sample Amazon product URLs for testing:
URLS=(
  "http://www.amazon.com/gp/product/B00VVOCSOU"
  "http://www.amazon.com/gp/product/B00YD545CC"
  "http://www.amazon.com/gp/product/B01LZKNRR3"
  "http://www.amazon.com/gp/product/B00ZV9RDKK"
  "http://www.amazon.com/gp/product/B00BGGDVOO"
)

echo "=== Faros AI Word Cloud - Simulating Requests ==="
echo "Target: ${BASE_URL}"
echo "Delay between requests: ${DELAY}s"
echo ""

# Submit URLs
for url in "${URLS[@]}"; do
  echo ">>> POST /wordcloud?url=${url}"
  curl -s -X POST "${BASE_URL}/wordcloud?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${url}', safe=''))")" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
  echo ""
  sleep "$DELAY"
done

# Test duplicate URL (should be deduplicated)
echo ">>> POST /wordcloud (duplicate URL - should be deduplicated):"
curl -s -X POST "${BASE_URL}/wordcloud?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${URLS[0]}', safe=''))")" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# Wait for processing
echo ">>> Waiting ${DELAY}s for processor to finish..."
sleep "$DELAY"

# Get word cloud
echo ">>> GET /wordcloud?top=10:"
curl -s "${BASE_URL}/wordcloud?top=10" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

echo "=== Done ==="
