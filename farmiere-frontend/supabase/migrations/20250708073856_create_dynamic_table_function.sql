-- Create a function to dynamically create tables
CREATE OR REPLACE FUNCTION create_table_if_not_exists(table_name TEXT, table_sql TEXT)
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
        AND table_name = table_name
    ) THEN
        -- Execute the CREATE TABLE statement
        EXECUTE table_sql;
        result := 'Table ' || table_name || ' created successfully';
    ELSE
        result := 'Table ' || table_name || ' already exists';
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating table %: %', table_name, SQLERRM;
END;
$$;