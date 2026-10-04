# 🌐 Google Cloud Storage (GCS) Deployment Guide for DRWEB AERO

This step-by-step guide walks you through deploying the static **DRWEB AERO** website to Google Cloud Storage (GCS) with public access, custom domain mapping, HTTPS, and Cloud CDN acceleration.

---

## 1. Prerequisites

Ensure you have Google Cloud SDK (`gcloud`) installed and authenticated:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

---

## 2. Step 1: Create a Cloud Storage Bucket

Bucket names for static websites hosted without a load balancer must match the domain name (e.g. `drwebaero.in` or `www.drwebaero.in`), or you can use any unique name if deploying behind Cloud CDN / HTTPS Load Balancer.

```bash
# Set your desired bucket name
export BUCKET_NAME="drwebaero-static-site"
export REGION="asia-south1" # Or us-central1 / nearest region

# Create the bucket with standard storage class
gcloud storage buckets create gs://$BUCKET_NAME \
    --location=$REGION \
    --default-storage-class=STANDARD \
    --uniform-bucket-level-access
```

---

## 3. Step 2: Configure Bucket for Website Hosting

Assign `index.html` as the default landing index page and `404.html` as the error page:

```bash
gcloud storage buckets update gs://$BUCKET_NAME \
    --web-main-page-suffix=index.html \
    --web-error-page=404.html
```

---

## 4. Step 3: Grant Public Read Access (`allUsers`)

Grant public read permissions so anyone on the web can view the site:

```bash
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
    --member=allUsers \
    --role=roles/storage.objectViewer
```

---

## 5. Step 4: Upload Website Files to GCS

Navigate to your `drweb` project directory and sync all files:

```bash
cd "d:/drone wen/drweb"

# Upload all files with gzip caching headers
gcloud storage rsync -r . gs://$BUCKET_NAME/ \
    --exclude=".git/*"
```

Set optimal caching headers for CSS and JS assets:

```bash
# Cache CSS and JS for high performance
gcloud storage objects update gs://$BUCKET_NAME/css/*.css \
    --content-type="text/css" \
    --cache-control="public, max-age=86400"

gcloud storage objects update gs://$BUCKET_NAME/js/*.js \
    --content-type="application/javascript" \
    --cache-control="public, max-age=86400"

gcloud storage objects update gs://$BUCKET_NAME/*.html \
    --content-type="text/html" \
    --cache-control="public, max-age=3600"
```

---

## 6. Step 5: Direct Public Access URL

Once uploaded, your website is immediately live and accessible via:

```
https://storage.googleapis.com/drwebaero-static-site/index.html
```

---

## 7. Step 6: Custom Domain, HTTPS, and Cloud CDN Setup

For a production custom domain (e.g., `https://drwebaero.in`) with automated Google-managed SSL and Cloud CDN edge caching:

### A. Reserve a Global Static External IP Address
```bash
gcloud compute addresses create drweb-ip \
    --network-tier=PREMIUM \
    --ip-version=IPV4 \
    --global
```

Find the reserved IP:
```bash
gcloud compute addresses describe drweb-ip --global --format="get(address)"
```

### B. Create a Backend Bucket with Cloud CDN
```bash
gcloud compute backend-buckets create drweb-backend-bucket \
    --gcs-bucket-name=$BUCKET_NAME \
    --enable-cdn
```

### C. Create URL Map & Google-Managed SSL Certificate
```bash
# Create URL Map pointing to the backend bucket
gcloud compute url-maps create drweb-url-map \
    --default-backend-bucket=drweb-backend-bucket

# Create Google-managed SSL Certificate
gcloud compute ssl-certificates create drweb-ssl-cert \
    --domains=drwebaero.in,www.drwebaero.in \
    --global

# Create Target HTTPS Proxy
gcloud compute target-https-proxies create drweb-https-proxy \
    --url-map=drweb-url-map \
    --ssl-certificates=drweb-ssl-cert

# Create Global Forwarding Rule (Port 443)
gcloud compute forwarding-rules create drweb-https-forwarding-rule \
    --address=drweb-ip \
    --global \
    --target-https-proxy=drweb-https-proxy \
    --ports=443
```

### D. Update DNS A-Records
Go to your domain registrar (Google Domains, Cloudflare, GoDaddy, etc.) and create an **A Record**:
- **Name**: `@` and `www`
- **Type**: `A`
- **Value**: The reserved IP address from Step 7A (`drweb-ip`)

SSL certificates typically provision within 15–30 minutes of DNS propagation.
