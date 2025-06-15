-- Insert sample data for testing

-- Insert sample intermediate admin user
INSERT INTO users (username, email, password_hash, first_name, middle_name, last_name, role, created_by) 
VALUES (
    'intermediate_admin',
    'intermediate@bank.et',
    crypt('password123', gen_salt('bf')),
    'John',
    'Doe',
    'Smith',
    'intermediate_admin',
    (SELECT id FROM users WHERE username = 'superadmin')
);

-- Insert sample data encoder user
INSERT INTO users (username, email, password_hash, first_name, middle_name, last_name, role, created_by) 
VALUES (
    'data_encoder',
    'encoder@bank.et',
    crypt('password123', gen_salt('bf')),
    'Jane',
    'Mary',
    'Johnson',
    'data_encoder',
    (SELECT id FROM users WHERE username = 'intermediate_admin')
);

-- Insert sample branches
INSERT INTO branches (
    branch_name, branch_code, reporting_entity_id, country, state_region, 
    city_town, subcity_zone, woreda, kebele, house_number, postal_address,
    phone_number, email, created_by
) VALUES 
(
    'Head Office',
    'HO001',
    (SELECT id FROM reporting_entities WHERE entity_name = 'Commercial Bank of Ethiopia'),
    'Ethiopia',
    'Addis Ababa',
    'Addis Ababa',
    'Kirkos',
    'Kirkos',
    '08',
    '1001',
    'P.O. Box 255, Addis Ababa',
    '+251-11-551-7438',
    'headoffice@cbe.com.et',
    (SELECT id FROM users WHERE username = 'intermediate_admin')
),
(
    'Bole Branch',
    'BOL001',
    (SELECT id FROM reporting_entities WHERE entity_name = 'Commercial Bank of Ethiopia'),
    'Ethiopia',
    'Addis Ababa',
    'Addis Ababa',
    'Bole',
    'Bole',
    '03',
    '2001',
    'Bole Road, Addis Ababa',
    '+251-11-661-8000',
    'bole@cbe.com.et',
    (SELECT id FROM users WHERE username = 'intermediate_admin')
),
(
    'Merkato Branch',
    'MER001',
    (SELECT id FROM reporting_entities WHERE entity_name = 'Commercial Bank of Ethiopia'),
    'Ethiopia',
    'Addis Ababa',
    'Addis Ababa',
    'Addis Ketema',
    'Addis Ketema',
    '01',
    '3001',
    'Merkato, Addis Ababa',
    '+251-11-551-2345',
    'merkato@cbe.com.et',
    (SELECT id FROM users WHERE username = 'intermediate_admin')
);

-- Insert sample STR report
INSERT INTO str_reports (
    transaction_date_time, transaction_type, fund_amount_birr, transaction_currency,
    transaction_manner_id, transaction_branch_id, account_number, account_owner_first_name,
    account_owner_last_name, person_first_name, person_last_name, suspicious_reason,
    crime_type_id, status, created_by
) VALUES (
    '2024-01-15 14:30:00+03',
    'withdrawal',
    500000.00,
    'ETB',
    (SELECT id FROM transaction_manner WHERE manner_name = 'Cash'),
    (SELECT id FROM branches WHERE branch_name = 'Bole Branch'),
    '1234567890',
    'Ahmed',
    'Mohammed',
    'Ahmed',
    'Mohammed',
    'Customer attempted to withdraw large amount of cash in multiple transactions to avoid reporting thresholds. Showed nervousness and provided inconsistent information about the source of funds.',
    (SELECT id FROM crime_types WHERE crime_name = 'Money Laundering'),
    'submitted',
    (SELECT id FROM users WHERE username = 'data_encoder')
);

-- Insert sample CTR report
INSERT INTO ctr_reports (
    transaction_date_time, transaction_type, amount, currency_type, conductor_type,
    conductor_first_name, conductor_last_name, conductor_id_number, account_number,
    transaction_purpose, transaction_manner_id, transaction_branch_id, created_by
) VALUES (
    '2024-01-16 10:15:00+03',
    'deposit',
    250000.00,
    'ETB',
    'individual',
    'Meron',
    'Tadesse',
    'ID123456789',
    '9876543210',
    'Business revenue deposit',
    (SELECT id FROM transaction_manner WHERE manner_name = 'Cash'),
    (SELECT id FROM branches WHERE branch_name = 'Head Office'),
    (SELECT id FROM users WHERE username = 'data_encoder')
);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(
    (SELECT id FROM users WHERE username = 'superadmin'),
    'New STR Report Submitted',
    'A new suspicious transaction report has been submitted and requires review.',
    'info'
),
(
    (SELECT id FROM users WHERE username = 'intermediate_admin'),
    'Monthly Report Due',
    'Monthly compliance report is due in 3 days.',
    'warning'
),
(
    (SELECT id FROM users WHERE username = 'data_encoder'),
    'Report Approved',
    'Your STR report STR-2024-000001 has been approved.',
    'success'
);
