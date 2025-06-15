-- CTR (Currency Transaction Reports) table
CREATE TABLE ctr_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Transaction Information
    transaction_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('withdrawal', 'deposit', 'transfer')),
    currency_type VARCHAR(10) DEFAULT 'ETB',
    amount DECIMAL(15,2) NOT NULL,
    transaction_manner_id UUID REFERENCES transaction_manner(id),
    transaction_branch_id UUID REFERENCES branches(id),
    
    -- Who is conducting the transaction
    conductor_type VARCHAR(20) NOT NULL CHECK (conductor_type IN ('individual', 'company', 'organization')),
    
    -- Individual Conductor Details
    conductor_first_name VARCHAR(100),
    conductor_middle_name VARCHAR(100),
    conductor_last_name VARCHAR(100),
    conductor_id_number VARCHAR(50),
    conductor_passport_number VARCHAR(50),
    conductor_phone VARCHAR(20),
    conductor_address TEXT,
    
    -- Company/Organization Conductor Details
    conductor_company_name VARCHAR(255),
    conductor_registration_number VARCHAR(100),
    conductor_tax_id VARCHAR(50),
    conductor_business_type VARCHAR(100),
    conductor_company_address TEXT,
    conductor_representative_name VARCHAR(255),
    conductor_representative_phone VARCHAR(20),
    
    -- Account Information
    account_number VARCHAR(50),
    account_type VARCHAR(50),
    account_owner_name VARCHAR(255),
    account_balance DECIMAL(15,2),
    
    -- Purpose of Transaction
    transaction_purpose TEXT,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'processed', 'archived')),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ctr_reports
CREATE INDEX idx_ctr_reports_number ON ctr_reports(report_number);
CREATE INDEX idx_ctr_reports_status ON ctr_reports(status);
CREATE INDEX idx_ctr_reports_transaction_date ON ctr_reports(transaction_date_time);
CREATE INDEX idx_ctr_reports_amount ON ctr_reports(amount);
CREATE INDEX idx_ctr_reports_conductor_type ON ctr_reports(conductor_type);
CREATE INDEX idx_ctr_reports_created_by ON ctr_reports(created_by);
CREATE INDEX idx_ctr_reports_branch ON ctr_reports(transaction_branch_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ctr_reports_updated_at BEFORE UPDATE ON ctr_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
