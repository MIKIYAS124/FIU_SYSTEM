-- Insert initial data

-- Insert default super admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) 
VALUES (
    uuid_generate_v4(),
    'superadmin',
    'admin@fiu.gov.et',
    crypt('admin123', gen_salt('bf')),
    'System',
    'Administrator',
    'super_admin',
    true
);

-- Insert default transaction manners
INSERT INTO transaction_manner (manner_name, description, created_by) VALUES
('Cash', 'Cash transactions', (SELECT id FROM users WHERE username = 'superadmin')),
('Telegram Transfer', 'Telegram money transfer', (SELECT id FROM users WHERE username = 'superadmin')),
('Account To Account', 'Direct account to account transfer', (SELECT id FROM users WHERE username = 'superadmin')),
('International Transaction', 'Cross-border transactions', (SELECT id FROM users WHERE username = 'superadmin')),
('Wire Transfer', 'Wire transfer transactions', (SELECT id FROM users WHERE username = 'superadmin')),
('Mobile Banking', 'Mobile banking transactions', (SELECT id FROM users WHERE username = 'superadmin')),
('Online Banking', 'Internet banking transactions', (SELECT id FROM users WHERE username = 'superadmin')),
('ATM Transaction', 'ATM-based transactions', (SELECT id FROM users WHERE username = 'superadmin'));

-- Insert default crime types
INSERT INTO crime_types (crime_name, description, severity_level, created_by) VALUES
('Terrorism And Terrorist Financing', 'Activities related to terrorism and its financing', 'critical', (SELECT id FROM users WHERE username = 'superadmin')),
('Corruption', 'Corrupt practices and bribery', 'high', (SELECT id FROM users WHERE username = 'superadmin')),
('Tax Evasion', 'Avoiding payment of taxes', 'high', (SELECT id FROM users WHERE username = 'superadmin')),
('Human Trafficking', 'Trafficking of persons', 'critical', (SELECT id FROM users WHERE username = 'superadmin')),
('Goods and Cash Smuggling(Contraband)', 'Illegal import/export of goods and cash', 'high', (SELECT id FROM users WHERE username = 'superadmin')),
('Illegal Hawala', 'Unauthorized money transfer services', 'high', (SELECT id FROM users WHERE username = 'superadmin')),
('Fraud', 'Financial fraud and deception', 'medium', (SELECT id FROM users WHERE username = 'superadmin')),
('Money Laundering', 'Concealing the origins of illegal money', 'critical', (SELECT id FROM users WHERE username = 'superadmin')),
('Drug Trafficking', 'Illegal drug trade', 'critical', (SELECT id FROM users WHERE username = 'superadmin')),
('Arms Trafficking', 'Illegal weapons trade', 'critical', (SELECT id FROM users WHERE username = 'superadmin')),
('Cybercrime', 'Computer and internet-related crimes', 'medium', (SELECT id FROM users WHERE username = 'superadmin')),
('Identity Theft', 'Stealing personal information', 'medium', (SELECT id FROM users WHERE username = 'superadmin'));

-- Insert sample reporting entity
INSERT INTO reporting_entities (
    entity_name, tax_id, business_type, issuing_country, registration_number, 
    country_of_origin, country, state_region, city_town, subcity_zone, 
    woreda, kebele, house_number, postal_address, created_by
) VALUES (
    'Commercial Bank of Ethiopia',
    'TIN001234567',
    'Commercial Bank',
    'Ethiopia',
    'REG001234567',
    'Ethiopia',
    'Ethiopia',
    'Addis Ababa',
    'Addis Ababa',
    'Bole',
    'Bole',
    '03',
    '1234',
    'P.O. Box 255, Addis Ababa',
    (SELECT id FROM users WHERE username = 'superadmin')
);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public, created_by) VALUES
('system_name', 'Financial Intelligence Unit System', 'string', 'Name of the system', true, (SELECT id FROM users WHERE username = 'superadmin')),
('ctr_threshold_amount', '200000', 'number', 'Threshold amount for CTR reporting in ETB', false, (SELECT id FROM users WHERE username = 'superadmin')),
('max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', false, (SELECT id FROM users WHERE username = 'superadmin')),
('allowed_file_types', '["pdf", "doc", "docx", "xlsx", "xls", "jpg", "jpeg", "png", "zip"]', 'json', 'Allowed file types for uploads', false, (SELECT id FROM users WHERE username = 'superadmin')),
('session_timeout', '3600', 'number', 'Session timeout in seconds', false, (SELECT id FROM users WHERE username = 'superadmin')),
('password_min_length', '8', 'number', 'Minimum password length', false, (SELECT id FROM users WHERE username = 'superadmin')),
('enable_email_notifications', 'true', 'boolean', 'Enable email notifications', false, (SELECT id FROM users WHERE username = 'superadmin')),
('system_timezone', 'Africa/Addis_Ababa', 'string', 'System timezone', false, (SELECT id FROM users WHERE username = 'superadmin'));
