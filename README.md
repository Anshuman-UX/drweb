# GRAVITAS — Autonomous Aerial Instrument
### Archival Feature-Showcase & Technical Monograph

> *"Sees like an eagle. Flies like a whisper."*

GRAVITAS is a complete, static feature-showcase website engineered as an online museum exhibition and technical monograph for an advanced autonomous hexacopter. It is **not** an e-commerce platform; nothing is sold on this site. Its sole purpose is to make visitors understand, admire, and remember what Gravitas can do through technical precision, authentic imagery, and restrained, editorial motion.

---

## 🏛️ Monograph Directory & Architecture

The website contains **18 fully responsive HTML pages** structured around an editorial museum hierarchy:

```
drweb/
├── index.html                   # 00 // Monograph Overview (Hero 3D Tilt, Telemetry HUD, Regimes)
├── features.html                # 01 // Archival Index of 8 Core Subsystems
├── in-flight.html               # 02 // Operational Regimes & Dynamic Flight Scenarios
├── engineering.html             # 03 // Interactive Exploded Mechanical Strata Teardown
├── specs.html                   # 04 // Complete Technical & Performance Matrix
├── gallery.html                 # 05 // Curated Visual Retrospective & Accessible Lightbox
├── story.html                   # 06 // Etymology, Philosophy & Archival Essays
├── faq.html                     # 07 // Technical FAQ with Smooth Accessible Accordions
├── contact.html                 # 08 // Curatorial Inquiries & Institutional Partnerships
├── 404.html                     # Error Page with Architectural Navigation & Recovery
│
├── features/                    # 8 Dedicated Deep-Dive Subsystem Monographs
│   ├── airframe.html            # 01 // Autoclaved T1000 Carbon Monocoque & Titanium Nodes
│   ├── propulsion.html          # 02 // WhisperDrive™ Toroidal Rotors (48.5 dBA at 15m)
│   ├── battery.html             # 03 // Solid-State Lithium-Sulfur Core (52-Min Endurance)
│   ├── camera.html              # 04 // Full-Frame 3-Axis Precision Gimbal & 8K Cinema
│   ├── sensors.html             # 05 // OmniSight™ 360° Solid-State Hex LiDAR
│   ├── tracking.html            # 06 // EagleEye™ 40-TOPS Cognitive Neural Vision
│   ├── transmission.html        # 07 // SkyLink™ Tri-Band SDR (15km Encrypted Link)
│   └── navigation.html          # 08 // Dual-Band RTK Geodetic Guidance & Auto-Perch
│
├── assets/
│   ├── images/                  # High-Resolution Photographic Media (Coast, Glacier, Forest, Bridge, Studio)
│   └── svg/                     # Hand-Crafted Hexacopter Blueprints, Exploded Layers & Dimensions
├── css/
│   └── style.css                # Single Monolithic Editorial Design System (5 Tokens, Zero Frameworks)
├── js/
│   ├── main.js                  # Accessible Lightbox, Mobile Drawer, Accordions, Form Validation
│   ├── motion.js                # 3D Hero Perspective Tilt, HUD Telemetry Switcher, Rotors Spin
│   └── explode.js               # Interactive Mechanical Strata Layer Dispersion Engine
│
├── .github/workflows/deploy.yml # Automated GitHub Pages Deployment Action
├── deploy.sh                    # One-Click Google Cloud Storage Deployment (macOS / Linux)
├── deploy.ps1                   # One-Click Google Cloud Storage Deployment (Windows PowerShell)
├── vercel.json                  # Zero-Config Vercel Deployment Configuration
├── netlify.toml                 # Zero-Config Netlify Deployment Configuration
└── DEPLOY.md                    # Complete GCS, Cloud CDN & Custom Domain Production Runbook
```

---

## ⚡ Key Engineering & Design Pillars

1. **Zero External Dependencies / Zero Frameworks:**
   * Built with pure semantic HTML5, Vanilla CSS, and lightweight Vanilla JavaScript.
   * Total progressive enhancement: full functional readability and layout stability if JavaScript is disabled.

2. **Aerospace Hexacopter (HEX) Silhouette:**
   * 6 symmetric radial carbon-fiber arms.
   * 6 continuous toroidal rotor loops (WhisperDrive™).
   * Faceted stealth hexagonal monocoque chassis with titanium joint nodes.

3. **Curated Editorial Aesthetic (5 Design Tokens):**
   * **Warm Bone** (`#F9F8F6`): Editorial gallery off-white background.
   * **Architectural Titanium** (`#EFECE6`): Technical surface tone.
   * **Obsidian Charcoal** (`#121316`): High-contrast typography.
   * **Technical Slate** (`#62656E`): Secondary data points and labels.
   * **Signal Aerospace Orange** (`#FF4B26`): Restrained single accent.

4. **Dynamic Restrained Motion:**
   * Interactive 3D mouse perspective tilt on hero drone stage.
   * Live telemetry HUD with 4 switchable flight regimes (`RECON 360°`, `WHISPER STEALTH`, `CINEMATIC 8K`, `APEX 72 KM/H`) dynamically modifying rotor rotation velocities.
   * 360° scanning LiDAR radar sweep and pulsing beacon waypoints.

---

## 🚀 Deployment Options

### Option 1: Google Cloud Storage (GCS) Static Website

Deploy in seconds using the automated one-click scripts:

```bash
# macOS / Linux
chmod +x ./deploy.sh
./deploy.sh your-bucket-name us-central1

# Windows PowerShell
.\deploy.ps1 -BucketName "your-bucket-name" -Region "us-central1"
```

Refer to [`DEPLOY.md`](./DEPLOY.md) for full Cloud CDN and SSL setup instructions.

### Option 2: GitHub Pages (Automatic)

Pushing to the `master` branch automatically triggers `.github/workflows/deploy.yml`. Enable GitHub Pages under **Repository Settings → Pages → Build and deployment: GitHub Actions**.

### Option 3: Vercel or Netlify

Connect your GitHub repository directly to Vercel or Netlify. The included `vercel.json` and `netlify.toml` automatically configure clean URLs and long-term immutable caching headers.

### Option 4: Local Testing

Run any local static HTTP server from the project directory:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```
Navigate to `http://localhost:8080`.

---

## 📄 License & Archival Notice

© 2026 GRAVITAS. All engineering designs and architectural monographs reserved.
<!-- BRAND-NAME-PLACEHOLDER -->
*Archival technical monograph. Not an e-commerce platform.*
