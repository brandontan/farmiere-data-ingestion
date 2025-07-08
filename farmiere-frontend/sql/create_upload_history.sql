-- Create upload_history table for duplicate file detection
CREATE TABLE IF NOT EXISTS upload_history (
  id SERIAL PRIMARY KEY,
  file_hash VARCHAR(64) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  data_source VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upload_history_file_hash ON upload_history(file_hash);
CREATE INDEX IF NOT EXISTS idx_upload_history_data_source ON upload_history(data_source);
CREATE INDEX IF NOT EXISTS idx_upload_history_upload_date ON upload_history(upload_date);

-- Create unique constraint to prevent duplicate hash + data_source combinations
CREATE UNIQUE INDEX IF NOT EXISTS idx_upload_history_unique 
ON upload_history(file_hash, data_source);