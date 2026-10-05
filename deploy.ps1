<#
.SYNOPSIS
    GRAVITAS — One-Click Google Cloud Storage (GCS) Static Deployment Script for Windows PowerShell
.EXAMPLE
    .\deploy.ps1 -BucketName "gravitas-showcase-monograph" -Region "us-central1"
#>

param(
    [string]$BucketName = "gravitas-showcase-monograph",
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host " Deploying GRAVITAS Static Monograph to gs://$BucketName" -ForegroundColor Cyan
Write-Host " Region: $Region" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# 1. Bucket creation check
try {
    gcloud storage buckets describe "gs://$BucketName" 2>$null | Out-Null
    Write-Host "--> Bucket gs://$BucketName exists." -ForegroundColor Green
} catch {
    Write-Host "--> Creating storage bucket gs://$BucketName..." -ForegroundColor Yellow
    gcloud storage buckets create "gs://$BucketName" --location=$Region --default-storage-class=STANDARD --uniform-bucket-level-access
}

# 2. Configure web index and error page
Write-Host "--> Configuring web endpoints (index.html / 404.html)..." -ForegroundColor Yellow
gcloud storage buckets update "gs://$BucketName" --web-main-page-suffix=index.html --web-error-page=404.html

# 3. Public IAM policy
Write-Host "--> Granting public read access..." -ForegroundColor Yellow
gcloud storage buckets add-iam-policy-binding "gs://$BucketName" --member=allUsers --role=roles/storage.objectViewer

# 4. Sync CSS and JS
Write-Host "--> Uploading CSS & JS (1-year immutable cache)..." -ForegroundColor Yellow
gcloud storage rsync ./css "gs://$BucketName/css" --recursive --cache-control="public, max-age=31536000, immutable"
gcloud storage rsync ./js "gs://$BucketName/js" --recursive --cache-control="public, max-age=31536000, immutable"

# 5. Sync Assets
Write-Host "--> Uploading images & SVGs (30-day cache)..." -ForegroundColor Yellow
gcloud storage rsync ./assets "gs://$BucketName/assets" --recursive --cache-control="public, max-age=2592000"

# 6. Upload HTML files
Write-Host "--> Uploading root HTML files..." -ForegroundColor Yellow
gcloud storage cp ./*.html "gs://$BucketName/" --cache-control="public, max-age=600, must-revalidate" --content-type="text/html"

Write-Host "--> Uploading feature monographs..." -ForegroundColor Yellow
gcloud storage cp ./features/*.html "gs://$BucketName/features/" --cache-control="public, max-age=600, must-revalidate" --content-type="text/html"

Write-Host "===========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host " Public URL: https://storage.googleapis.com/$BucketName/index.html" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Green
