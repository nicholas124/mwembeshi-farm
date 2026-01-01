# 🌾 Mwembeshi Farm Management System

A comprehensive, mobile-friendly farm management application designed for mixed-use farms in Zambia. Built with simplicity, low cost, and offline-first capabilities in mind.

## 🎯 Features

### Core Modules
- **🐐 Livestock Management**: Track goats, cows, sheep, and village chickens
- **🌱 Crop Management**: Monitor tomatoes, onions, maize, rape, and other crops
- **👷 Worker Management**: Attendance, tasks, and payroll tracking
- **🔧 Equipment Tracking**: Inventory, maintenance logs, and usage records

### Key Capabilities
- Mobile-friendly responsive design
- Offline-first with data sync
- Multi-language support ready (English, Bemba, Nyanja)
- Low-bandwidth optimized
- Simple, intuitive interface for farm staff

## 🏗️ Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend** | Next.js 14 + React | Fast, SEO-friendly, great DX |
| **Styling** | Tailwind CSS | Rapid UI development, mobile-first |
| **Backend** | Next.js API Routes | Unified codebase, serverless-ready |
| **Database** | PostgreSQL (Supabase) | Free tier, real-time, auth included |
| **ORM** | Prisma | Type-safe, easy migrations |
| **Offline** | Service Workers + IndexedDB | Works without internet |
| **PWA** | next-pwa | Installable on mobile devices |
| **Hosting** | Vercel + Supabase | Free tier, global CDN |

## 📁 Project Structure

```
farm-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── livestock/     # Animal management
│   │   │   ├── crops/         # Crop management
│   │   │   ├── workers/       # Staff management
│   │   │   ├── equipment/     # Tools & equipment
│   │   │   ├── tasks/         # Task management
│   │   │   └── reports/       # Analytics & reports
│   │   ├── api/               # API routes
│   │   └── auth/              # Authentication
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities & helpers
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── i18n/                  # Internationalization
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mwembeshi-farm.git
cd mwembeshi-farm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 🌐 Deployment

### Recommended: Vercel + Supabase (Free Tier)

1. **Supabase Setup**:
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Copy database URL to environment variables

2. **Vercel Deployment**:
   - Connect GitHub repository to Vercel
   - Add environment variables
   - Deploy automatically on push

### Alternative Hosting Options
- **Railway**: Easy PostgreSQL + Node hosting
- **Render**: Free tier with PostgreSQL
- **Fly.io**: Edge deployment, good for Africa

## 📱 Offline Support

The app uses Progressive Web App (PWA) technology:
- **Service Workers**: Cache static assets
- **IndexedDB**: Store data locally
- **Background Sync**: Sync when online

To install on mobile:
1. Visit the app in Chrome/Safari
2. Tap "Add to Home Screen"
3. Use like a native app

## 🌍 Localization

The app supports multiple languages:
- English (default)
- Bemba (planned)
- Nyanja (planned)

Language files are in `/src/i18n/locales/`

## 📊 Database Schema

See [docs/DATABASE.md](docs/DATABASE.md) for complete schema documentation.

## 🛣️ Roadmap

### Phase 1: MVP (Current)
- [x] Basic CRUD for livestock
- [x] Basic CRUD for crops
- [x] Worker attendance
- [x] Equipment inventory

### Phase 2: Enhanced Features
- [ ] Breeding records
- [ ] Yield tracking
- [ ] Input cost tracking
- [ ] Weather integration

### Phase 3: Advanced
- [ ] Financial reports
- [ ] Market price integration
- [ ] Mobile app (React Native)
- [ ] SMS notifications

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 👥 Support

For issues or questions:
- Create GitHub issue
- Email: support@mwembishifarm.com

---

Built with ❤️ for Zambian farmers
