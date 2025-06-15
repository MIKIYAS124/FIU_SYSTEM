-- Create audit triggers for important tables

-- Audit trigger for users table
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Audit trigger for reporting_entities table
CREATE TRIGGER audit_reporting_entities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reporting_entities
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Audit trigger for str_reports table
CREATE TRIGGER audit_str_reports_trigger
    AFTER INSERT OR UPDATE OR DELETE ON str_reports
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Audit trigger for ctr_reports table
CREATE TRIGGER audit_ctr_reports_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ctr_reports
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Audit trigger for branches table
CREATE TRIGGER audit_branches_trigger
    AFTER INSERT OR UPDATE OR DELETE ON branches
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Trigger to automatically generate report numbers
CREATE OR REPLACE FUNCTION auto_generate_report_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
        IF TG_TABLE_NAME = 'str_reports' THEN
            NEW.report_number := generate_report_number('STR');
        ELSIF TG_TABLE_NAME = 'ctr_reports' THEN
            NEW.report_number := generate_report_number('CTR');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-generation triggers
CREATE TRIGGER auto_str_report_number_trigger
    BEFORE INSERT ON str_reports
    FOR EACH ROW EXECUTE FUNCTION auto_generate_report_number();

CREATE TRIGGER auto_ctr_report_number_trigger
    BEFORE INSERT ON ctr_reports
    FOR EACH ROW EXECUTE FUNCTION auto_generate_report_number();
