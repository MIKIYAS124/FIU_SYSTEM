-- Create useful views for reporting and analytics

-- View for user statistics
CREATE VIEW user_statistics AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN last_login > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_last_30_days
FROM users 
GROUP BY role;

-- View for STR report summary
CREATE VIEW str_report_summary AS
SELECT 
    s.id,
    s.report_number,
    s.transaction_date_time,
    s.fund_amount_birr,
    s.status,
    s.created_at,
    u.first_name || ' ' || u.last_name as created_by_name,
    b.branch_name,
    ct.crime_name,
    re.entity_name
FROM str_reports s
LEFT JOIN users u ON s.created_by = u.id
LEFT JOIN branches b ON s.transaction_branch_id = b.id
LEFT JOIN crime_types ct ON s.crime_type_id = ct.id
LEFT JOIN reporting_entities re ON b.reporting_entity_id = re.id;

-- View for CTR report summary
CREATE VIEW ctr_report_summary AS
SELECT 
    c.id,
    c.report_number,
    c.transaction_date_time,
    c.amount,
    c.conductor_type,
    c.status,
    c.created_at,
    u.first_name || ' ' || u.last_name as created_by_name,
    b.branch_name,
    re.entity_name
FROM ctr_reports c
LEFT JOIN users u ON c.created_by = u.id
LEFT JOIN branches b ON c.transaction_branch_id = b.id
LEFT JOIN reporting_entities re ON b.reporting_entity_id = re.id;

-- View for branch statistics
CREATE VIEW branch_statistics AS
SELECT 
    b.id,
    b.branch_name,
    re.entity_name,
    COUNT(DISTINCT s.id) as str_reports_count,
    COUNT(DISTINCT c.id) as ctr_reports_count,
    COALESCE(SUM(s.fund_amount_birr), 0) as total_str_amount,
    COALESCE(SUM(c.amount), 0) as total_ctr_amount
FROM branches b
LEFT JOIN reporting_entities re ON b.reporting_entity_id = re.id
LEFT JOIN str_reports s ON b.id = s.transaction_branch_id
LEFT JOIN ctr_reports c ON b.id = c.transaction_branch_id
GROUP BY b.id, b.branch_name, re.entity_name;

-- View for monthly report statistics
CREATE VIEW monthly_report_statistics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    'STR' as report_type,
    COUNT(*) as report_count,
    SUM(fund_amount_birr) as total_amount
FROM str_reports
GROUP BY DATE_TRUNC('month', created_at)
UNION ALL
SELECT 
    DATE_TRUNC('month', created_at) as month,
    'CTR' as report_type,
    COUNT(*) as report_count,
    SUM(amount) as total_amount
FROM ctr_reports
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- View for crime type statistics
CREATE VIEW crime_type_statistics AS
SELECT 
    ct.crime_name,
    COUNT(s.id) as report_count,
    SUM(s.fund_amount_birr) as total_amount,
    AVG(s.fund_amount_birr) as average_amount
FROM crime_types ct
LEFT JOIN str_reports s ON ct.id = s.crime_type_id
GROUP BY ct.id, ct.crime_name
ORDER BY report_count DESC;
