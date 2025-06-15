-- Create useful functions for the system

-- Function to generate report numbers
CREATE OR REPLACE FUNCTION generate_report_number(report_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    year_part VARCHAR := TO_CHAR(CURRENT_DATE, 'YYYY');
    sequence_num INTEGER;
    report_num VARCHAR;
BEGIN
    IF report_type = 'STR' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(report_number FROM 9 FOR 6) AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM str_reports
        WHERE report_number LIKE 'STR-' || year_part || '-%';
        
        report_num := 'STR-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    ELSIF report_type = 'CTR' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(report_number FROM 9 FOR 6) AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM ctr_reports
        WHERE report_number LIKE 'CTR-' || year_part || '-%';
        
        report_num := 'CTR-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    ELSE
        RAISE EXCEPTION 'Invalid report type: %', report_type;
    END IF;
    
    RETURN report_num;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (
            COALESCE(CURRENT_SETTING('app.current_user_id', true)::UUID, NULL),
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (
            COALESCE(CURRENT_SETTING('app.current_user_id', true)::UUID, NULL),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (
            COALESCE(CURRENT_SETTING('app.current_user_id', true)::UUID, NULL),
            'INSERT',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(permission VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT CASE u.role
        WHEN 'super_admin' THEN unnest(ARRAY[
            'manage_users', 'manage_reporting_entities', 'manage_transaction_manner',
            'manage_crime_types', 'view_all_reports', 'manage_system_settings'
        ])
        WHEN 'intermediate_admin' THEN unnest(ARRAY[
            'manage_branches', 'manage_data_encoders', 'view_branch_reports'
        ])
        WHEN 'data_encoder' THEN unnest(ARRAY[
            'create_str_reports', 'create_ctr_reports', 'upload_files', 'view_own_reports'
        ])
        ELSE NULL
    END as permission
    FROM users u
    WHERE u.id = user_uuid AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;
