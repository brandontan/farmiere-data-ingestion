-- Create temporary data tables for each data source
CREATE TABLE IF NOT EXISTS temp_tiktok_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT,
  price DECIMAL,
  quantity INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS temp_shopee_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT,
  price DECIMAL,
  quantity INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS temp_aipost_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id TEXT,
  commission DECIMAL,
  clicks INTEGER,
  conversions INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS temp_goaffpro_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id TEXT,
  commission DECIMAL,
  sales DECIMAL,
  referrals INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_temp_tiktok_data_created_at ON temp_tiktok_data(created_at);
CREATE INDEX IF NOT EXISTS idx_temp_shopee_data_created_at ON temp_shopee_data(created_at);
CREATE INDEX IF NOT EXISTS idx_temp_aipost_data_created_at ON temp_aipost_data(created_at);
CREATE INDEX IF NOT EXISTS idx_temp_goaffpro_data_created_at ON temp_goaffpro_data(created_at);