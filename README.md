<p align="center">
  <img src="docs/diagrams/synaps-banner.png" alt="Synaps" width="100%" />
</p>

<h1 align="center">Synaps</h1>

<p align="center">
  <strong>A self-hosted personal media cloud for your NAS.</strong><br>
  Browse, organize, and stream your entire photo and video library — locally, with no subscription.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.5-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/frontend-Next.js_14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/database-SQLite-003B57?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/license-Personal_Use-lightgrey?style=flat-square" alt="License" />
</p>

---

## What is Synaps?

Synaps is a personal media cloud that you run on your own Network Attached Storage (NAS) or home server. It indexes your photos and videos from the NAS filesystem, generates thumbnails, and presents them through a beautiful browser interface inspired by Apple Photos.

**The core idea:** Your NAS already has all your photos. Synaps makes them browsable.

- **No cloud required** — Everything stays on your hardware
- **No subscription** — Run it forever for free
- **Apple Photos aesthetic** — Liquid Glass UI, chronological timeline, fullscreen viewer
- **Import pipeline** — Organize staged photos into dated folders automatically
- **Multi-device aware** — Browse by source: iPhone, Mac, or other devices

---

## Features

### 📸 Media Management
- Automatic filesystem indexer — walks NAS directories on startup
- EXIF date extraction for JPEG and PNG
- HEIC metadata extraction (iPhone photos)
- Video metadata extraction via ffprobe
- Filename-based date fallback parsing
- Media type classification (image, video, screenshot, screen recording)
- Soft-delete trash with 30-day auto-expiry and restore
- Database cleanup tools with dry-run mode

### 🗓 Timeline
- Apple Photos-style chronological grid grouped by month and year
- Old Photos archive — media before a configurable cutoff year is separated automatically
- Infinite scroll with 80-item pages (NAS-friendly memory usage)
- Sticky year/month section headers *(in progress)*

### 🖼 Gallery
- Dense grid mode (Gallery View) as an alternative to Timeline View
- Toggle between views with a segmented control
- Fullscreen Media Viewer with keyboard navigation, zoom, and video streaming
- Metadata panel showing date, filename, file size, and source

### 🔍 Search & Filters
- Filename and folder search with real-time results
- Source filters — filter by device: iPhone, Mac, Windows, or All
- Screenshot filter
- Screenshot and screen recording classification

### 📥 Import Manager
- Preview mode — shows exactly where each file will land before any files are moved
- Automatic date routing: `YYYY/MM/`, `Old_Photos/`, or `Unknown_Date/`
- Background job with real-time progress polling (handles 9+ GB import folders)
- Content-based duplicate detection (two-stage: file size → SHA-256)
- Post-import automatic re-indexing

### 🔄 Scanner
- Configurable scan paths (`ALLOWED_SCAN_PATHS`)
- Configurable excluded paths (`EXCLUDED_PATHS`) — skip private or irrelevant directories
- Source detection via `SOURCE_MAPPING` — maps NAS folder names to device identifiers
- On-demand WebP thumbnail generation with LIFO priority queue
- Multiple thumbnail worker threads for parallel generation

### 🎨 UI
- **Liquid Glass design system** — frosted glass panels with blur and translucency
- Light and Dark themes — system-aware with localStorage persistence
- `GlassButton`, `GlassPanel`, `GlassSegmentedControl`, `GlassToolbar` components
- Responsive layout — optimized for iPhone Safari and desktop
- Framer Motion animations throughout

---

## Screenshots

> *Screenshots will be added once the v0.5 UI redesign is complete.*

| Timeline View | Gallery View | Import Manager |
|:---:|:---:|:---:|
| *(coming soon)* | *(coming soon)* | *(coming soon)* |

| Media Viewer | Settings | Sidebar |
|:---:|:---:|:---:|
| *(coming soon)* | *(coming soon)* | *(coming soon)* |

---

## Architecture

```
Browser (iPhone / Mac)
        │
        ▼
  Next.js Server :3000
  (proxy rewrites /api/* → localhost:8000)
        │
        ▼
  FastAPI Backend :8000
  ├── scanner.py        ← indexes NAS on startup
  ├── thumbnails.py     ← generates WebP thumbnails on demand
  ├── import_manager.py ← organizes staged imports
  └── routers/          ← REST API endpoints
        │
        ▼
  SQLite (synaps.db)
        │
        ▼
  NAS Filesystem (/storage/Vault/...)
```

The frontend never talks directly to the backend. All API calls go through Next.js's proxy rewrite (`next.config.js`), so from the browser's perspective everything is on the same origin — no CORS configuration needed.

---

## Folder Structure

```
nas_dashboard/
├── backend/                   # Python / FastAPI
│   ├── main.py                # App entry point, startup scan, router registration
│   ├── config.py              # All configuration (storage paths, extensions, etc.)
│   ├── database.py            # SQLAlchemy engine and session factory
│   ├── models.py              # MediaFile, TrashItem, SyncRecord, Setting
│   ├── scanner.py             # Async filesystem indexer + EXIF/video date extraction
│   ├── thumbnails.py          # WebP thumbnail generator with LIFO queue
│   ├── import_manager.py      # Import pipeline with background job tracking
│   ├── routers/
│   │   ├── media.py           # Timeline, thumbnails, file serving, streaming
│   │   ├── finder.py          # Directory browser and tree view
│   │   ├── sync.py            # iPhone upload with deduplication
│   │   ├── search.py          # Filename/folder search
│   │   ├── trash.py           # Trash management (soft delete, restore, purge)
│   │   └── settings.py        # App settings and storage stats
│   ├── migrations/            # One-shot Python migration scripts
│   ├── clean_stale_records.py # Database cleanup with dry-run mode
│   └── audit_duplicates.py    # Duplicate detection report
│
├── frontend/                  # TypeScript / Next.js 14
│   └── src/
│       ├── app/               # Pages (Next.js App Router)
│       │   ├── layout.tsx     # Root layout (AppShell, ThemeProvider)
│       │   ├── page.tsx       # Timeline + Gallery (home: /)
│       │   ├── finder/        # /finder — directory browser
│       │   ├── search/        # /search — media search
│       │   ├── sync/          # /sync — iPhone upload + Import Manager
│       │   ├── trash/         # /trash — deleted files
│       │   └── settings/      # /settings — configuration
│       ├── components/
│       │   ├── AppShell.tsx          # Root wrapper (sidebar + content layout)
│       │   ├── Sidebar.tsx           # Navigation sidebar
│       │   ├── TopBar.tsx            # Top bar with search and scan button
│       │   ├── MediaGrid.tsx         # Photo/video thumbnail grid
│       │   ├── MediaViewer.tsx       # Fullscreen viewer modal
│       │   ├── ThemeProvider.tsx     # Light/dark theme context
│       │   └── glass/               # Glass UI component library
│       │       ├── GlassButton.tsx
│       │       ├── GlassPanel.tsx
│       │       ├── GlassSegmentedControl.tsx
│       │       └── GlassToolbar.tsx
│       └── lib/
│           ├── api.ts          # All backend API calls
│           └── store.ts        # Global state (Zustand)
│
├── mock_storage/              # Synthetic NAS directory tree for local development
├── docs/                      # Detailed technical documentation (15 guides)
├── setup.sh                   # One-time setup (venv, pip, npm install)
├── start.sh                   # Start both servers (development)
├── start-prod.sh              # Start both servers (production, no hot-reload)
├── deploy.sh                  # Push to GitHub
├── update.sh                  # Pull + rebuild on NAS (run via SSH)
├── CHANGELOG.md               # Version history
├── ROADMAP.md                 # What's planned
├── PROJECT_HISTORY.md         # Development journal
└── VERSIONING.md              # Versioning strategy
```

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Backend framework** | FastAPI | Latest | Async, auto-docs at `/docs` |
| **Backend language** | Python | 3.11+ | |
| **ORM** | SQLAlchemy | Latest | Sync session; migration to async planned |
| **Database** | SQLite | Built-in | Single file; no server required |
| **Image processing** | Pillow + pillow-heif | Latest | JPEG, PNG, HEIC support |
| **Video processing** | ffmpeg (system) | — | Frame extraction for thumbnails |
| **EXIF metadata** | exifread | Latest | Date, camera, GPS extraction |
| **Frontend framework** | Next.js | 14.2.x | App Router, proxy rewrites |
| **UI language** | TypeScript + React | 18 | |
| **State management** | Zustand | 4.5.x | Lightweight global state |
| **Animations** | Framer Motion | 11 | Page transitions, micro-animations |
| **Icons** | Lucide React | 0.454 | |
| **Styling** | Tailwind CSS | v3.4 | + custom glass design tokens |

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- `ffmpeg` installed on the system (for video thumbnails)
- `libheif` / `pillow-heif` compatible environment (for iPhone HEIC files)

### Quick Start (Local Development)

```bash
# 1. Clone the project
git clone https://github.com/HarshRathod48981/synaps.git
cd synaps

# 2. One-time setup (creates Python venv, installs all dependencies)
chmod +x setup.sh
./setup.sh

# 3. Configure storage path (optional — defaults to mock_storage/)
echo "SYNAPS_STORAGE_PATH=/path/to/your/photos" > backend/.env

# 4. Start both servers
chmod +x start.sh
./start.sh
```

Open **http://localhost:3000** in your browser.

### Manual Setup (Step by Step)

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py          # Starts FastAPI on :8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev             # Starts Next.js on :3000
```

### Configuration

All configuration lives in `backend/config.py` and can be overridden with environment variables in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `SYNAPS_STORAGE_PATH` | `./mock_storage` | Root path to your NAS media library |
| `SYNAPS_DB_URL` | `sqlite:///./synaps.db` | Database connection string |
| `SYNAPS_THUMBNAIL_DIR` | `./backend/thumbnails` | Thumbnail cache directory |
| `SYNAPS_TRASH_DIR` | `./backend/trash` | Trash staging directory |
| `SYNAPS_HOST` | `0.0.0.0` | Backend bind address |
| `SYNAPS_PORT` | `8000` | Backend port |

---

## NAS Deployment

### Prerequisites on the NAS

```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip nodejs npm ffmpeg
```

### Initial Deployment

```bash
# From your development machine — push to GitHub
./deploy.sh

# SSH into your NAS
ssh user@192.168.0.101
cd /opt/synaps

# Clone the repo (first time only)
git clone https://github.com/HarshRathod48981/synaps.git .

# Configure your storage path
echo "SYNAPS_STORAGE_PATH=/storage" > backend/.env

# Setup and start
./setup.sh
./start-prod.sh
```

Access from any device on your local network: **http://192.168.0.101:3000**

### Updating the NAS

```bash
# From your development machine
./deploy.sh     # Push changes to GitHub

# On the NAS (or via SSH)
./update.sh     # Pulls latest, rebuilds frontend, restarts services
```

### Auto-Start with systemd

Create `/etc/systemd/system/synaps-backend.service`:

```ini
[Unit]
Description=Synaps Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/synaps/backend
ExecStart=/opt/synaps/backend/venv/bin/python main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/synaps-frontend.service`:

```ini
[Unit]
Description=Synaps Frontend
After=network.target synaps-backend.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/synaps/frontend
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable synaps-backend synaps-frontend
sudo systemctl start synaps-backend synaps-frontend
```

---

## Documentation

The `docs/` directory contains 15 detailed technical guides:

| Guide | Description |
|-------|-------------|
| [01 — Project Overview](docs/01_project_overview.md) | Architecture, data flow, technology decisions |
| [02 — Backend Architecture](docs/02_backend_architecture.md) | FastAPI structure, startup sequence, router design |
| [03 — Frontend Architecture](docs/03_frontend_architecture.md) | Next.js structure, component hierarchy, styling system |
| [04 — Database & Indexing](docs/04_database_and_indexing.md) | Schema, models, migrations |
| [05 — Media Scanner](docs/05_media_scanner.md) | File walking, EXIF extraction, classification logic |
| [06 — Thumbnail Pipeline](docs/06_thumbnail_pipeline.md) | On-demand generation, LIFO queue, caching |
| [07 — API Reference](docs/07_api_reference.md) | Full endpoint documentation |
| [08 — Routing & Navigation](docs/08_routing_and_navigation.md) | Next.js App Router, page structure |
| [09 — State Management](docs/09_state_management.md) | Zustand store, global state patterns |
| [10 — Sync Engine](docs/10_sync_engine.md) | iPhone upload, deduplication |
| [11 — Deployment & Services](docs/11_deployment_and_services.md) | NAS deployment, systemd, nginx |
| [12 — Debugging Guide](docs/12_debugging_guide.md) | Common issues and how to diagnose them |
| [13 — Performance Guide](docs/13_performance_guide.md) | NAS optimization, memory usage |
| [14 — Code Flow Examples](docs/14_code_flow_examples.md) | Request lifecycle walkthroughs |
| [15 — Future Improvements](docs/15_future_improvements.md) | Known bugs, planned improvements with code examples |

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full roadmap organized by:
- ✅ Completed features
- 🔄 In Progress
- 📋 Planned (v0.6 – v1.0)
- 💡 Future Ideas (AI, face recognition, multi-user)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a version-by-version history of what was built and when.

Current version: **v0.5** — Apple Photos UI (in progress)

---

## Project History

See [PROJECT_HISTORY.md](PROJECT_HISTORY.md) for a narrative development journal — why each major decision was made, what problems existed before each solution, and what was learned along the way.

---

## License

Personal use. Built for a home NAS.
