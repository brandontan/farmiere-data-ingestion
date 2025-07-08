-- Create upload_history table for duplicate file detection
CREATE TABLE upload_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_hash VARCHAR(64) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  data_source VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_upload_history_file_hash ON upload_history(file_hash);
CREATE INDEX idx_upload_history_data_source ON upload_history(data_source);
CREATE INDEX idx_upload_history_filename ON upload_history(original_filename);

-- Create unique constraint to prevent duplicate hash + data_source combinations
-- (This is optional - we handle duplicates at the application level)
-- CREATE UNIQUE INDEX idx_upload_history_unique ON upload_history(file_hash, data_source);