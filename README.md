# Farmière Data Ingestion System

A secure data ingestion portal for uploading CSV files from multiple e-commerce platforms to Supabase.

## 🚀 Features

- **Multi-Source Support**: TikTok Shop, Shopee, aiPost, GoAffPro
- **CSV Validation**: Detects and rejects files with dangerous symbols
- **Duplicate Detection**: Prevents re-uploading identical files using SHA-256 hashing
- **Smart Table Management**: One table per source, automatic append for new data
- **Secure Deployment**: Environment variables for sensitive credentials
- **Modern UI**: Next.js 15 with Tailwind CSS and shadcn/ui

## 📁 Project Structure

```
farmiere-data-ingestion/
├── farmiere-frontend/          # Next.js frontend application
│   ├── app/                   # App router pages and API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities and Supabase client
│   └── public/                # Static assets (logo)
└── CLAUDE.md                  # Project context and requirements
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd farmiere-data-ingestion
```

2. Install dependencies:
```bash
cd farmiere-frontend
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔒 Security

- All API keys are stored in environment variables
- Service role key is server-side only
- Comprehensive CSV validation
- SQL injection prevention

## 📊 Data Flow

1. **Upload**: Select source → Upload CSV → Validate
2. **Process**: Check duplicates → Create/append to table
3. **Store**: Data saved to `temp_[source]_data` tables

## 🚀 Deployment

See [DEPLOYMENT.md](farmiere-frontend/DEPLOYMENT.md) for Vercel deployment instructions.

## 📝 License

Private repository for Farmière use only.