#!/usr/bin/env bash
# ==============================================================================
# GRAVITAS — ONE-CLICK GOOGLE CLOUD STORAGE (GCS) STATIC DEPLOYMENT SCRIPT
# Usage: ./deploy.sh [BUCKET_NAME] [REGION]
# Example: ./deploy.sh gravitas-showcase-monograph us-central1
# ==============================================================================

set -euo pipefail

BUCKET_NAME="${1:-gravitas-showcase-monograph}"
REGION="${2:-us-central1}"

echo "==========================================================="
echo " Deploying GRAVITAS Static Monograph to gs://${BUCKET_NAME}"
echo " Region: ${REGION}"
echo "==========================================================="

# 1. Create bucket if it doesn't already exist
if ! gcloud storage buckets describe "gs://${BUCKET_NAME}" &>/dev/null; then
  echo "--> Creating storage bucket gs://${BUCKET_NAME}..."
  gcloud storage buckets create "gs://${BUCKET_NAME}" \
    --location="${REGION}" \
    --default-storage-class=STANDARD \
    --uniform-bucket-level-access
fi

# 2. Configure web index and 404 error page
echo "--> Configuring web endpoint (index.html / 404.html)..."
gcloud storage buckets update "gs://${BUCKET_NAME}" \
  --web-main-page-suffix=index.html \
  --web-error-page=404.html

# 3. Grant public read access
echo "--> Granting public read access..."
gcloud storage buckets add-iam-policy-binding "gs://${BUCKET_NAME}" \
  --member=allUsers \
  --role=roles/storage.objectViewer

# 4. Sync CSS and JS with long immutable cache (1 year)
echo "--> Syncing CSS & JS assets (1-year cache)..."
gcloud storage rsync ./css "gs://${BUCKET_NAME}/css" \
  --recursive \
  --cache-control="public, max-age=31536000, immutable"

gcloud storage rsync ./js "gs://${BUCKET_NAME}/js" \
  --recursive \
  --cache-control="public, max-age=31536000, immutable"

# 5. Sync media assets (images, SVGs) (30-day cache)
echo "--> Syncing media assets (30-day cache)..."
gcloud storage rsync ./assets "gs://${BUCKET_NAME}/assets" \
  --recursive \
  --cache-control="public, max-age=2592000"

# 6. Upload HTML files with revalidation cache (10 minutes)
echo "--> Uploading root HTML files..."
gcloud storage cp ./*.html "gs://${BUCKET_NAME}/" \
  --cache-control="public, max-age=600, must-revalidate" \
  --content-type="text/html"

echo "--> Uploading feature monograph HTML files..."
gcloud storage cp ./features/*.html "gs://${BUCKET_NAME}/features/" \
  --cache-control="public, max-age=600, must-revalidate" \
  --content-type="text/html"

echo "==========================================================="
echo " DEPLOYMENT SUCCESSFUL!"
echo " Public Web URL: https://storage.googleapis.com/${BUCKET_NAME}/index.html"
echo "==========================================================="
