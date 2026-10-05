# GRAVITAS — GOOGLE CLOUD STORAGE (GCS) STATIC DEPLOYMENT RUNBOOK

This guide provides the exact `gcloud` and `gsutil` commands to deploy the **GRAVITAS Autonomous Aerial Instrument** feature-showcase website as a high-performance static website on Google Cloud Storage (GCS), backed by Cloud CDN and SSL.

---

## 1. Prerequisites

1. Install and authenticate the Google Cloud SDK:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Enable the Google Cloud Storage API:
   ```bash
   gcloud services enable storage.googleapis.com compute.googleapis.com
   ```

---

## 2. Bucket Creation & Website Configuration

Set your desired bucket name (if using a custom domain directly via CNAME, the bucket name must match the domain, e.g., `gravitas.aero`):

```bash
export BUCKET_NAME="gravitas-showcase-monograph"
export REGION="us-central1"

# 1. Create a uniform bucket-level access storage bucket
gcloud storage buckets create gs://$BUCKET_NAME \
  --location=$REGION \
  --default-storage-class=STANDARD \
  --uniform-bucket-level-access

# 2. Configure default web index and 404 error page
gcloud storage buckets update gs://$BUCKET_NAME \
  --web-main-page-suffix=index.html \
  --web-error-page=404.html
```

---

## 3. Public Read Permissions

Grant all users public read permission to view the static site:

```bash
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

---

## 4. Asset Syncing with Optimized Cache Headers

To guarantee fast page loads (90+ Lighthouse targets) while preventing stale HTML caches:

```bash
# A. Upload CSS and JS assets with a 1-year immutable cache header
gcloud storage rsync ./css gs://$BUCKET_NAME/css \
  --recursive \
  --cache-control="public, max-age=31536000, immutable"

gcloud storage rsync ./js gs://$BUCKET_NAME/js \
  --recursive \
  --cache-control="public, max-age=31536000, immutable"

# B. Upload SVGs and images with 30-day cache
gcloud storage rsync ./assets gs://$BUCKET_NAME/assets \
  --recursive \
  --cache-control="public, max-age=2592000"

# C. Upload HTML files with short cache & revalidation (10 minutes)
gcloud storage cp ./*.html gs://$BUCKET_NAME/ \
  --cache-control="public, max-age=600, must-revalidate" \
  --content-type="text/html"

gcloud storage cp ./features/*.html gs://$BUCKET_NAME/features/ \
  --cache-control="public, max-age=600, must-revalidate" \
  --content-type="text/html"
```

The site will now be directly accessible at:
```
https://storage.googleapis.com/gravitas-showcase-monograph/index.html
```

---

## 5. Custom Domain, SSL & Cloud CDN Setup

For a production custom domain (e.g., `https://gravitas.archive.org`):

### Step A: Reserve an External Static IP
```bash
gcloud compute addresses create gravitas-static-ip \
  --network-tier=PREMIUM \
  --global
```

### Step B: Create a Backend Bucket with Cloud CDN
```bash
gcloud compute backend-buckets create gravitas-backend-bucket \
  --gcs-bucket-name=$BUCKET_NAME \
  --enable-cdn
```

### Step C: Create Google-Managed SSL Certificate
```bash
gcloud compute ssl-certificates create gravitas-ssl-cert \
  --domains=gravitas.archive.org \
  --global
```

### Step D: Wire the URL Map and HTTPS Proxy
```bash
# 1. Create URL Map
gcloud compute url-maps create gravitas-url-map \
  --default-backend-bucket=gravitas-backend-bucket

# 2. Create Target HTTPS Proxy with SSL Certificate
gcloud compute target-https-proxies create gravitas-https-proxy \
  --url-map=gravitas-url-map \
  --ssl-certificates=gravitas-ssl-cert

# 3. Create Global Forwarding Rule pointing port 443 to the Static IP
gcloud compute forwarding-rules create gravitas-https-rule \
  --address=gravitas-static-ip \
  --global \
  --target-https-proxy=gravitas-https-proxy \
  --ports=443
```

### Step E: DNS Configuration
Add an `A` record at your DNS registrar pointing `gravitas.archive.org` to the allocated static IP address. Cloud CDN will automatically cache assets globally at edge nodes, delivering sub-100ms first-contentful paint worldwide.
