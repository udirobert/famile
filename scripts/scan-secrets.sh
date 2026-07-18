#!/usr/bin/env bash
# Scans staged files for common secret/credential patterns.
# Exits 1 if a potential secret is found, blocking the commit.
set -euo pipefail

PATTERNS=(
  'AKIA[0-9A-Z]{16}'                         # AWS access key ID
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'       # private key blocks
  'gh[pousr]_[A-Za-z0-9]{36,}'               # GitHub token
  'github_pat_[A-Za-z0-9_]{82}'              # GitHub fine-grained PAT
  'sk_live_[A-Za-z0-9]{20,}'                 # Stripe secret key
  'rk_live_[A-Za-z0-9]{20,}'                 # Stripe restricted key
  'xox[baprs]-[A-Za-z0-9-]+'                  # Slack token
  'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.'   # JWT
  'AIza[0-9A-Za-z_-]{35}'                     # Google API key
  'sk-[A-Za-z0-9]{20,}'                       # OpenAI / generic sk- key
)

# Staged text files only (skip binaries, lock files, fonts, and this script itself)
STAGED=$(git diff --cached --name-only --diff-filter=ACMR \
  | grep -vE '\.(svg|png|jpg|jpeg|gif|ico|webp|lock|woff2?|ttf|otf)$' \
  | grep -v 'scripts/scan-secrets.sh' \
  || true)

if [ -z "$STAGED" ]; then
  echo "  no text files staged, skipping"
  exit 0
fi

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(echo "$STAGED" | xargs rg -l --no-config -e "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo "  potential secret detected (pattern: $pattern)"
    echo "$MATCHES" | while read -r f; do
      echo "    $f:"
      rg -n --no-config -e "$pattern" "$f" 2>/dev/null | head -2 | sed 's/^/      /'
    done
    FOUND=1
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "  Commit blocked: potential secrets found."
  echo "  Review the matches above. If false positive, use: git commit --no-verify"
  exit 1
fi

echo "  no secrets detected"
