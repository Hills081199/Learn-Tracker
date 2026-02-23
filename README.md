# 📚 LearnTracker v1.0

> **Personal Learning Journey Management Application** — Track your goals, monitor progress, and maintain effective learning habits.

LearnTracker helps you organize and track your learning goals through daily learning journals with a Rich Text Editor, visual statistics, and a flexible tag management system.

---

## ✨ Key Features

### 🎯 Learning Goals Management
- Create and manage multiple learning goals
- Customize emoji, color, and description for each goal
- Track progress with timeline and target dates
- Categorize by status: Active, Paused, Completed, Archived
- Quick search and filter goals

### 📝 Learning Journal with Rich Text Editor
- **Powerful WYSIWYG Editor** powered by Tiptap:
  - Text formatting: Bold, Italic, Underline, Strikethrough
  - Headings (H1, H2, H3)
  - Lists: Bullet list, Numbered list, Checklist
  - Code blocks with syntax highlighting
  - Blockquote, Horizontal divider
  - Tables
- **Direct image upload** into content (drag & drop or paste)
- Record study duration (minutes)
- **Mood tracking**: Rate your learning session (1-5 levels)
- Tag entries for easy categorization and search
- Autosave draft content

### 📊 Dashboard & Statistics
- **Calendar Heatmap**: Visualize daily learning streaks (like GitHub contribution graph)
- **Time Charts**: Analyze study minutes by day/week
- **Overview Statistics**: Total records, total study hours, current streak
- **Recent Activities**: Quick view of recent learning entries
- Time allocation analysis across goals

### 🔍 Powerful Search & Filter
- Full-text search on content and titles
- Filter by: Goal, Tags, Date range, Mood level
- Multiple sort options: Newest, Oldest, Duration
- Keyword highlighting in search results

### 🏷️ Flexible Tag System
- Create and manage tags for Goals and Records
- Customize colors for easy distinction
- Multi-select tags when journaling
- Quick search by tags

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Rich Text Editor**: Tiptap
- **Charts**: Recharts
- **HTTP Client**: Axios
- **TypeScript**: Fully typed

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Database**: PostgreSQL 16

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Storage**: Local file system (uploads folder)
- **Hot Reload**: Volume mounts for live development

---

## 🚀 Installation & Setup Guide

### System Requirements
- Docker Desktop (latest version)
- Git

### Clone Repository
```bash
git clone <repository-url>
cd LearnTracker
```

### Start Application
```bash
docker-compose up --build
```

The first run will take a few minutes to build images and install dependencies.

### Access Application
Once Docker containers are successfully started:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger UI)**: http://localhost:8000/docs
- **Database**: PostgreSQL at `localhost:5432`

### Stop Application
```bash
docker-compose down
```

### Reset Database (delete all data)
```bash
docker-compose down -v
```

---

## 📁 Project Structure

```
LearnTracker/
├── docker-compose.yml           # Docker orchestration
├── .gitignore                   # Git ignore rules
├── README.md                    # Documentation
├── LearnTracker_Spec.md         # Feature specification
│
├── backend/                     # FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt         # Python dependencies
│   ├── uploads/                 # Uploaded images storage
│   └── app/
│       ├── main.py              # FastAPI application entry
│       ├── config.py            # Configuration & environment vars
│       ├── database.py          # Database connection & session
│       ├── models.py            # SQLAlchemy ORM models
│       ├── schemas.py           # Pydantic schemas (request/response)
│       └── routers/
│           ├── goals.py         # Goals CRUD endpoints
│           ├── records.py       # Learning records endpoints
│           ├── series.py        # Series/timeline endpoints
│           ├── stats.py         # Dashboard statistics
│           ├── tags.py          # Tags management
│           └── upload.py        # File upload handler
│
└── frontend/                    # Next.js Frontend
    ├── Dockerfile
    ├── package.json             # Node dependencies
    ├── next.config.ts           # Next.js configuration
    ├── tailwind.config.ts       # Tailwind CSS config
    ├── tsconfig.json            # TypeScript config
    ├── public/                  # Static assets
    └── src/
        ├── app/                 # Next.js App Router pages
        │   ├── layout.tsx       # Root layout
        │   ├── globals.css      # Global styles
        │   └── (dashboard)/     # Dashboard routes
        │       ├── goals/       # Goals pages
        │       ├── records/     # Records pages
        │       └── stats/       # Statistics pages
        ├── components/          # React components
        │   ├── Sidebar.tsx      # Navigation sidebar
        │   ├── MobileNav.tsx    # Mobile navigation
        │   ├── dashboard/       # Dashboard components
        │   ├── goals/           # Goal-related components
        │   ├── records/         # Record components
        │   └── series/          # Series/timeline components
        ├── lib/
        │   ├── api.ts           # API client & fetch utilities
        │   └── utils.ts         # Helper functions
        └── types/
            └── index.ts         # TypeScript type definitions
```

---

## 🔧 Development Guide

### Hot Reload
The application is configured with volume mounts for hot reload support:

- **Frontend**: Changes in `frontend/src/` automatically reload the page
- **Backend**: Changes in `backend/app/` automatically restart the server (uvicorn --reload)

### Working with Backend
```bash
# View backend logs
docker-compose logs -f backend

# Access backend container
docker exec -it learntracker-backend bash

# Run migrations (if needed)
docker exec -it learntracker-backend alembic upgrade head
```

### Working with Frontend
```bash
# View frontend logs
docker-compose logs -f frontend

# Install additional packages
cd frontend
npm install <package-name>

# Rebuild frontend image if dependencies changed
docker-compose up --build frontend
```

### Working with Database
```bash
# Connect to PostgreSQL
docker exec -it learntracker-db psql -U learntracker -d learntracker

# Backup database
docker exec learntracker-db pg_dump -U learntracker learntracker > backup.sql

# Restore database
cat backup.sql | docker exec -i learntracker-db psql -U learntracker -d learntracker
```

---

## 📡 API Documentation

The backend provides RESTful API with the following main endpoints:

### Goals API
- `GET /api/goals` - Get list of goals (supports filter, search)
- `POST /api/goals` - Create new goal
- `GET /api/goals/{id}` - Get goal details + statistics
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

### Records API
- `GET /api/records` - Get list of records (pagination, filter)
- `POST /api/records` - Create new record
- `GET /api/records/{id}` - Get record details
- `PUT /api/records/{id}` - Update record
- `DELETE /api/records/{id}` - Delete record
- `GET /api/goals/{goalId}/records` - Get records for a specific goal

### Stats API
- `GET /api/stats/dashboard` - Get dashboard overview statistics
- `GET /api/stats/heatmap` - Get calendar heatmap data
- `GET /api/stats/weekly` - Get weekly statistics

### Tags API
- `GET /api/tags` - Get list of tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

### Upload API
- `POST /api/upload/image` - Upload image (multipart/form-data)

**Full Details**: Visit http://localhost:8000/docs when the server is running.

---

## 🎨 Features Detail

### Rich Text Editor Features
The editor is powered by **Tiptap** with the following features:

#### Text Formatting
- **Bold** (`Ctrl+B` / `Cmd+B`)
- *Italic* (`Ctrl+I` / `Cmd+I`)
- <u>Underline</u> (`Ctrl+U` / `Cmd+U`)
- ~~Strikethrough~~ (`Ctrl+Shift+S`)

#### Structure
- Headings (H1, H2, H3) - `Ctrl+Alt+1/2/3`
- Bullet lists
- Numbered lists
- Task lists (checkboxes)
- Blockquotes
- Horizontal rules

#### Media & Code
- Image upload (drag & drop, paste, or file picker)
- Code blocks with syntax highlighting
- Tables

#### Keyboard Shortcuts
- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo
- `Ctrl+B` / `Cmd+B`: Bold
- `Ctrl+I` / `Cmd+I`: Italic

### Calendar Heatmap
Visualizes daily learning intensity:
- **Dark green**: High activity day (based on duration)
- **Light green**: Low activity day
- **Gray**: No records
- Click on a cell to view detailed records for that day

### Mood Tracking
5 emotion levels after each learning session:
1. 😞 Difficult, ineffective
2. 😐 Average
3. 😊 Pretty good (default)
4. 😄 Very good, effective
5. 🤩 Excellent, breakthrough

---

## 🗺️ Roadmap

### Version 1.0 (Current) ✅
- ✅ Complete CRUD for Goals & Records
- ✅ Rich Text Editor with image upload
- ✅ Dashboard with charts & heatmap
- ✅ Tag system
- ✅ Mood & duration tracking
- ✅ Full-text search
- ✅ Timeline view & Calendar view
- ✅ Responsive design (mobile-friendly)

### Version 2.0 (Planned)
- 🔲 **AI-powered features**:
  - AI Weekly Review Agent (summarize and evaluate weekly progress)
  - Smart Suggestions (recommend next learning content)
  - Quiz Generator from learned content
- 🔲 **Data Export**: JSON, Markdown, PDF
- 🔲 **Reminder System**: Push notifications & Email reminders
- 🔲 **Theme Customization**: Dark/Light mode
- 🔲 **Multi-user support**: Authentication & user management
- 🔲 **Mobile App**: React Native app
- 🔲 **Collaboration**: Share goals & records with others

---

## 📄 License

[Specify your license here]

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

[Your contact information]
