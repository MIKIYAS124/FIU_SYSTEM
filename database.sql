-- FIU System Database Schema (Enhanced Setup)

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'INTERMEDIATE_ADMIN', 'DATA_ENCODER')),
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reporting entities table
CREATE TABLE reporting_entities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create branches table
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER REFERENCES reporting_entities(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    manager_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    entity_id INTEGER REFERENCES reporting_entities(id),
    branch_id INTEGER REFERENCES branches(id),
    transaction_date DATE NOT NULL,
    transaction_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    account_number VARCHAR(50),
    account_holder_name VARCHAR(100),
    beneficiary_name VARCHAR(100),
    suspicious_activity TEXT,
    additional_info TEXT,
    transaction_manner_id INTEGER REFERENCES transaction_manners(id),
    crime_type_id INTEGER REFERENCES crime_types(id),
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New lookup tables
CREATE TABLE transaction_manners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE crime_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Insert default users
INSERT INTO users (username, email, password, role, full_name) VALUES
('superadmin', 'superadmin@fiu.gov.et', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN', 'Super Administrator'),
('admin', 'admin@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'INTERMEDIATE_ADMIN', 'Bank Administrator'),
('encoder', 'encoder@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'DATA_ENCODER', 'Data Encoder');

-- Insert sample reporting entities
INSERT INTO reporting_entities (name, type, license_number, contact_email, contact_phone, address) VALUES
('Commercial Bank of Ethiopia', 'Bank', 'CBE-001', 'info@cbe.com.et', '+251-11-551-7438', 'Addis Ababa, Ethiopia'),
('Awash Bank', 'Bank', 'AWB-002', 'info@awashbank.com', '+251-11-465-4545', 'Addis Ababa, Ethiopia'),
('Nyala Insurance', 'Insurance', 'NYI-003', 'info@nyalainsurance.com', '+251-11-662-7788', 'Addis Ababa, Ethiopia'),
('Amhara Credit and Savings', 'Microfinance', 'ACS-004', 'info@acsi.com.et', '+251-58-220-0071', 'Bahir Dar, Ethiopia');

-- Insert sample branches
INSERT INTO branches (entity_id, name, code, address, manager_name, phone, email) VALUES
(1, 'CBE Main Branch', 'CBE-MAIN', 'Churchill Avenue, Addis Ababa', 'Alemayehu Tadesse', '+251-11-551-7440', 'main@cbe.com.et'),
(1, 'CBE Merkato Branch', 'CBE-MERK', 'Merkato, Addis Ababa', 'Tigist Bekele', '+251-11-551-7441', 'merkato@cbe.com.et'),
(2, 'Awash Main Branch', 'AWB-MAIN', 'Ras Abebe Aregay Street, Addis Ababa', 'Dawit Haile', '+251-11-465-4546', 'main@awashbank.com'),
(3, 'Nyala Head Office', 'NYI-HEAD', 'Bole Road, Addis Ababa', 'Meron Teshome', '+251-11-662-7789', 'head@nyalainsurance.com');

-- Insert sample reports
INSERT INTO reports (report_number, user_id, entity_id, branch_id, transaction_date, transaction_amount, currency, account_number, account_holder_name, beneficiary_name, suspicious_activity, status) VALUES
('STR-2024-000001', 3, 1, 1, '2024-01-15', 500000.00, 'ETB', '1234567890', 'John Doe', 'Jane Smith', 'Large cash deposit with no clear source', 'SUBMITTED'),
('STR-2024-000002', 3, 1, 2, '2024-01-16', 750000.00, 'ETB', '0987654321', 'Ahmed Ali', 'Fatima Hassan', 'Multiple transactions just below reporting threshold', 'DRAFT'),
('STR-2024-000003', 3, 2, 3, '2024-01-17', 1200000.00, 'ETB', '1122334455', 'Bekele Tadesse', 'Marta Girma', 'Unusual international wire transfer pattern', 'SUBMITTED');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_branches_entity_id ON branches(entity_id);

-- COMMENT ON DATABASE fiu_system IS 'FIU System Database for Local Development';