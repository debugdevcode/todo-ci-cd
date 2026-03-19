#!/usr/bin/env bash
# -------------------------------------------------------
# Production smoke test — run after every successful deploy
# Usage: BASE_URL=https://your-app-domain ./scripts/smoke-test.sh
# -------------------------------------------------------

set -euo pipefail

BASE="${BASE_URL:-https://your-app-domain}/api/todos"
PASS=0
FAIL=0

pass() { echo "  ✅  $1"; ((PASS++)); }
fail() { echo "  ❌  $1"; ((FAIL++)); }

echo ""
echo "═══════════════════════════════════════════"
echo "  Smoke Test  →  $BASE"
echo "═══════════════════════════════════════════"

# ── Health check ──────────────────────────────────────
echo ""
echo "── Health check ──"
HEALTH=$(curl -sfL "${BASE_URL:-https://your-app-domain}/health")
if echo "$HEALTH" | grep -q '"success":true'; then
  pass "GET /health → success:true"
else
  fail "GET /health → unexpected response: $HEALTH"
fi

# ── CREATE ────────────────────────────────────────────
echo ""
echo "── CREATE ──"
TODO=$(curl -sfL -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke test todo","priority":"high"}')

if echo "$TODO" | grep -q '"success":true'; then
  pass "POST /api/todos → 201 created"
else
  fail "POST /api/todos → $TODO"
fi

ID=$(echo "$TODO" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

if [[ -z "$ID" ]]; then
  echo "Cannot extract _id — aborting remaining tests"
  exit 1
fi

# ── GET ALL ───────────────────────────────────────────
echo ""
echo "── GET ALL ──"
GET_ALL=$(curl -sfL "$BASE")
if echo "$GET_ALL" | grep -q '"success":true'; then
  pass "GET /api/todos → success:true"
else
  fail "GET /api/todos → $GET_ALL"
fi

# ── GET BY ID ─────────────────────────────────────────
echo ""
echo "── GET BY ID ──"
GET_ONE=$(curl -sfL "$BASE/$ID")
if echo "$GET_ONE" | grep -q '"success":true'; then
  pass "GET /api/todos/:id → success:true"
else
  fail "GET /api/todos/:id → $GET_ONE"
fi

# ── UPDATE ────────────────────────────────────────────
echo ""
echo "── UPDATE ──"
UPDATE=$(curl -sfL -X PUT "$BASE/$ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated smoke test","completed":true}')
if echo "$UPDATE" | grep -q '"completed":true'; then
  pass "PUT /api/todos/:id → completed:true"
else
  fail "PUT /api/todos/:id → $UPDATE"
fi

# ── TOGGLE ────────────────────────────────────────────
echo ""
echo "── TOGGLE ──"
TOGGLE=$(curl -sfL -X PATCH "$BASE/$ID/toggle")
if echo "$TOGGLE" | grep -q '"completed":false'; then
  pass "PATCH /api/todos/:id/toggle → toggled to false"
else
  fail "PATCH /api/todos/:id/toggle → $TOGGLE"
fi

# ── DELETE ────────────────────────────────────────────
echo ""
echo "── DELETE ──"
DELETE=$(curl -sfL -X DELETE "$BASE/$ID")
if echo "$DELETE" | grep -q '"success":true'; then
  pass "DELETE /api/todos/:id → success:true"
else
  fail "DELETE /api/todos/:id → $DELETE"
fi

# ── Summary ───────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════════"
echo ""

[[ $FAIL -eq 0 ]]   # exit 0 if all pass, non-zero if any fail
