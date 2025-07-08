# Farmière Data Ingestion Portal

A modern data ingestion frontend for uploading CSV files from TikTok Shop, Shopee, aiPost, and GoAffPro to Supabase.

## Features

### ✅ **Advanced CSV Validation**
- File extension validation (CSV only)
- File size limits (50MB max)
- Data integrity checks
- Special character detection
- SQL injection prevention
- Warning system for problematic data

### ✅ **Duplicate File Detection**
- **SHA-256 file hashing** for content-based duplicate detection
- **Upload history tracking** in Supabase
- **Prevents re-uploading identical files** even with different names
- **Smart error messages** showing when file was previously uploaded
- **Per data source tracking** (TikTok, Shopee, aiPost, GoAffPro)

### ✅ **Table Management**
- **Single table per data source**: `temp_tiktok_data`, `temp_shopee_data`, etc.
- **Append mode**: Subsequent files go to the same table (no new tables created)
- **Automatic table creation** with proper data types
- **Column type inference**: INTEGER, DECIMAL, BOOLEAN, TEXT, TIMESTAMP

### ✅ **User Experience**
- **Drag & drop file upload**
- **Real-time data preview** (first 10 rows)
- **Progress tracking** during upload
- **Comprehensive error handling**
- **Visual warnings** for data issues
- **Farmière branding** with logo

## Setup Instructions

### 1. Initial Database Setup
Click the **"One-time Database Setup"** button to create the `upload_history` table required for duplicate detection.

### 2. Upload Your First File
1. Select data source (TikTok Shop, Shopee, aiPost, or GoAffPro)
2. Drag & drop or browse for your CSV file
3. Review validation warnings if any
4. Preview your data
5. Choose target data source for table naming
6. Upload to Supabase

### 3. Subsequent Uploads
- Files will be **appended to existing tables**
- **Duplicate files will be blocked** automatically
- Same table structure maintained across uploads

## Database Schema

### Upload History Table
```sql
CREATE TABLE upload_history (
  id SERIAL PRIMARY KEY,
  file_hash VARCHAR(64) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  data_source VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Data Tables
- `temp_tiktok_data` - TikTok Shop data
- `temp_shopee_data` - Shopee data  
- `temp_aipost_data` - aiPost affiliate enrollment data
- `temp_goaffpro_data` - GoAffPro referral data

## API Endpoints

- `POST /api/upload` - Upload CSV data to Supabase
- `POST /api/check-duplicate` - Check for duplicate files
- `POST /api/setup-tables` - One-time database setup

## Development

```bash
npm install
npm run dev
```

## Environment

- **Next.js 15** with App Router
- **Supabase** for database operations
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Papa Parse** for CSV processing
- **SHA-256 hashing** for duplicate detection

## Security Features

- Server-side Supabase operations
- SQL injection prevention
- File content validation
- Service role authentication
- Data sanitization and cleaning

---

Built with ❤️ for Farmière's data ingestion needs