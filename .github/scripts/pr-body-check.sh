#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${1:-}" ]]; then
  body=$(cat "$1")
elif [[ -n "${PR_BODY:-}" ]]; then
  body="$PR_BODY"
elif [[ ! -t 0 ]]; then
  body=$(cat)
else
  echo "Pass a PR body on stdin, as a file argument, or in PR_BODY." >&2
  exit 2
fi

body=$(printf '%s\n' "$body" | tr -d '\r')

missing=0
for section in Summary Verification "Blast Radius"; do
  if ! printf '%s\n' "$body" | grep -Eiq "^#{1,6}[[:space:]]+${section}([[:space:]]|$)"; then
    echo "PR body is missing a ${section} section." >&2
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  echo "Add headings named Summary, Verification, and Blast Radius." >&2
  exit 1
fi

echo "PR body has Summary, Verification, and Blast Radius."
