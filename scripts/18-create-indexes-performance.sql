-- Additional performance indexes

-- Composite indexes for common queries
CREATE INDEX idx_str_reports_status_date ON str_reports(status, transaction_date_time);
CREATE INDEX idx_str_reports_created_by_date ON str_reports(created_by, created_at);
CREATE INDEX idx_str_reports_amount_date ON str_reports(fund_amount_birr, transaction_date_time);

CREATE INDEX idx_ctr_reports_status_date ON ctr_reports(status, transaction_date_time);
CREATE INDEX idx_ctr_reports_created_by_date ON ctr_reports(created_by, created_at);
CREATE INDEX idx_ctr_reports_amount_date ON ctr_reports(amount, transaction_date_time);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_table_date ON audit_logs(table_name, created_at);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);

-- Partial indexes for active records
CREATE INDEX idx_users_active_role ON users(role) WHERE is_active = true;
CREATE INDEX idx_branches_active_entity ON branches(reporting_entity_id) WHERE is_active = true;
CREATE INDEX idx_reporting_entities_active ON reporting_entities(status) WHERE status = 'active';

-- Text search indexes for better search performance
CREATE INDEX idx_str_reports_text_search ON str_reports USING gin(to_tsvector('english', 
    COALESCE(suspicious_reason, '') || ' ' || 
    COALESCE(additional_information, '') || ' ' ||
    COALESCE(person_first_name, '') || ' ' ||
    COALESCE(person_last_name, '')
));

CREATE INDEX idx_reporting_entities_text_search ON reporting_entities USING gin(to_tsvector('english',
    entity_name || ' ' || 
    COALESCE(business_type, '') || ' ' ||
    COALESCE(tax_id, '')
));
