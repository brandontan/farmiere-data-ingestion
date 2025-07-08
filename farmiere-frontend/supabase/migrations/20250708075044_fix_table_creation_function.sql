-- Drop and recreate the function with fixed parameter names
DROP FUNCTION IF EXISTS create_table_if_not_exists(TEXT, TEXT);

CREATE FUNCTION create_table_if_not_exists(table_name_param TEXT, table_sql_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result TEXT;
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name_param
    ) THEN
        -- Execute the CREATE TABLE statement
        EXECUTE table_sql_param;
        result := 'Table ' || table_name_param || ' created successfully';
    ELSE
        result := 'Table ' || table_name_param || ' already exists';
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating table %: %', table_name_param, SQLERRM;
END;
$$;