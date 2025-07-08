-- Drop all temporary tables created during testing
DROP TABLE IF EXISTS temp_tiktok_data CASCADE;
DROP TABLE IF EXISTS temp_shopee_data CASCADE;
DROP TABLE IF EXISTS temp_aipost_data CASCADE;
DROP TABLE IF EXISTS temp_goaffpro_data CASCADE;

-- Drop any indexes that might still exist
DROP INDEX IF EXISTS idx_temp_tiktok_data_created_at;
DROP INDEX IF EXISTS idx_temp_shopee_data_created_at;
DROP INDEX IF EXISTS idx_temp_aipost_data_created_at;
DROP INDEX IF EXISTS idx_temp_goaffpro_data_created_at;