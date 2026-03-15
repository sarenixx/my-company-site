#!/usr/bin/env bash

set -euo pipefail

APP_URL="${1:-https://my-company-site-seven.vercel.app}"
SCOPE="${VERCEL_SCOPE:-sarah-enixs-projects}"
WORKDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${WORKDIR}/web"

tmp_env="$(mktemp)"
tmp_no_secret="$(mktemp)"
tmp_with_secret="$(mktemp)"

cleanup() {
  rm -f "${tmp_env}" "${tmp_no_secret}" "${tmp_with_secret}"
}
trap cleanup EXIT

echo "Checking Vercel CLI authentication..."
if ! (cd "${WEB_DIR}" && npx vercel whoami >/dev/null 2>&1); then
  echo "Vercel CLI is not authenticated in this session."
  echo "Run: cd web && npx vercel login"
  exit 1
fi

echo "Pulling production env vars from Vercel..."
(cd "${WEB_DIR}" && npx vercel env pull "${tmp_env}" --environment=production --yes --scope "${SCOPE}" >/dev/null)

secret="$(grep '^SANITY_REVALIDATE_SECRET=' "${tmp_env}" | sed 's/^[^=]*=//; s/^"//; s/"$//')"
if [[ -z "${secret}" ]]; then
  echo "Missing SANITY_REVALIDATE_SECRET in Vercel production env."
  exit 1
fi

echo "Testing revalidate endpoint without secret (expect 401)..."
code_no_secret="$(curl -sS -o "${tmp_no_secret}" -w '%{http_code}' -X POST "${APP_URL}/api/revalidate" -H 'content-type: application/json' --data '{"_type":"homepage"}')"
if [[ "${code_no_secret}" != "401" ]]; then
  echo "Unexpected status without secret: ${code_no_secret}"
  cat "${tmp_no_secret}"
  exit 1
fi

echo "Testing revalidate endpoint with secret (expect 200)..."
code_with_secret="$(curl -sS -o "${tmp_with_secret}" -w '%{http_code}' -X POST "${APP_URL}/api/revalidate" -H "x-sanity-webhook-secret: ${secret}" -H 'content-type: application/json' --data '{"_type":"homepage"}')"
if [[ "${code_with_secret}" != "200" ]]; then
  echo "Unexpected status with secret: ${code_with_secret}"
  cat "${tmp_with_secret}"
  exit 1
fi

echo "PASS: Vercel and Sanity revalidation connection is working for ${APP_URL}."
