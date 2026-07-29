#!/usr/bin/env bash
# Generates a GPG signing key for AuroraPad release artifact verification
# and prints the values needed as GitHub Actions secrets.
#
# Usage: bash scripts/setup-gpg.sh
# Requirements: gpg (brew install gnupg)

set -euo pipefail

NAME="AuroraPad Releases"
EMAIL="releases@aurorapad.app"
PASSPHRASE="$(openssl rand -base64 32)"
KEY_TYPE="ed25519"
EXPIRE="2y"

echo "=== AuroraPad GPG Release Key Setup ==="
echo
echo "This script generates a GPG key used to sign SHA256SUMS.txt in each release."
echo "The private key and passphrase go into GitHub Actions secrets."
echo

if ! command -v gpg &>/dev/null; then
  echo "Error: gpg not found. Install with: brew install gnupg"
  exit 1
fi

BATCH_FILE="$(mktemp)"
trap 'rm -f "$BATCH_FILE"' EXIT

cat > "$BATCH_FILE" <<EOF
%no-protection
Key-Type: $KEY_TYPE
Key-Usage: sign
Subkey-Type: $KEY_TYPE
Subkey-Usage: sign
Name-Real: $NAME
Name-Email: $EMAIL
Expire-Date: $EXPIRE
Passphrase: $PASSPHRASE
%commit
EOF

echo "Generating $KEY_TYPE key..."
gpg --batch --gen-key "$BATCH_FILE"

KEY_ID="$(gpg --list-secret-keys --keyid-format LONG "$EMAIL" 2>/dev/null | grep '^sec' | head -1 | awk '{print $2}' | cut -d'/' -f2)"

if [[ -z "$KEY_ID" ]]; then
  echo "Error: could not find generated key."
  exit 1
fi

echo "Key generated: $KEY_ID"
echo

PRIVATE_KEY_B64="$(gpg --batch --passphrase "$PASSPHRASE" --pinentry-mode loopback \
  --armor --export-secret-keys "$KEY_ID" | base64)"

PUBLIC_KEY="$(gpg --armor --export "$KEY_ID")"

echo "=== GitHub Actions Secrets ==="
echo
echo "Go to: https://github.com/<your-org>/<your-repo>/settings/secrets/actions"
echo "Add these two secrets:"
echo
echo "Secret name:  GPG_PRIVATE_KEY"
echo "Secret value:"
echo "$PRIVATE_KEY_B64"
echo
echo "Secret name:  GPG_PASSPHRASE"
echo "Secret value: $PASSPHRASE"
echo
echo "=== Public Key (publish this so users can verify downloads) ==="
echo
echo "$PUBLIC_KEY"
echo
echo "=== Save the public key ==="
PUBKEY_FILE="build/aurorapad-releases.gpg.pub.asc"
printf '%s\n' "$PUBLIC_KEY" > "$PUBKEY_FILE"
echo "Public key saved to $PUBKEY_FILE"
echo "Commit this file so users can import it to verify release signatures."
echo
echo "Users verify downloads with:"
echo "  gpg --import $PUBKEY_FILE"
echo "  gpg --verify SHA256SUMS.txt.asc SHA256SUMS.txt"
