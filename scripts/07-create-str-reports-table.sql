-- STR (Suspicious Transaction Reports) table
CREATE TABLE str_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Transaction Information
    transaction_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('withdrawal', 'deposit', 'transfer')),
    other_currency VARCHAR(10),
    fund_amount_birr DECIMAL(15,2) NOT NULL,
    transaction_currency VARCHAR(10) DEFAULT 'ETB',
    transaction_manner_id UUID REFERENCES transaction_manner(id),
    transaction_branch_id UUID REFERENCES branches(id),
    
    -- Account Information
    account_branch_name VARCHAR(255),
    date_of_balance_held DATE,
    account_number VARCHAR(50),
    balance_held DECIMAL(15,2),
    account_owner_first_name VARCHAR(100),
    account_owner_middle_name VARCHAR(100),
    account_owner_last_name VARCHAR(100),
    account_date_opened DATE,
    account_date_closed DATE,
    account_type VARCHAR(50),
    
    -- Beneficiary Information
    beneficiary_type VARCHAR(20) CHECK (beneficiary_type IN ('individual', 'company')),
    beneficiary_full_name VARCHAR(255),
    beneficiary_phone VARCHAR(20),
    beneficiary_id_passport VARCHAR(50),
    beneficiary_woreda VARCHAR(100),
    beneficiary_kebele VARCHAR(100),
    beneficiary_state_region VARCHAR(100),
    beneficiary_date_of_birth DATE,
    beneficiary_company_name VARCHAR(255),
    beneficiary_company_branch VARCHAR(255),
    beneficiary_company_account VARCHAR(50),
    beneficiary_company_balance DECIMAL(15,2),
    beneficiary_tax_tin VARCHAR(50),
    beneficiary_address TEXT,
    
    -- Association Information
    association_type VARCHAR(20) CHECK (association_type IN ('individual', 'company')),
    association_first_name VARCHAR(100),
    association_middle_name VARCHAR(100),
    association_last_name VARCHAR(100),
    association_other_name VARCHAR(100),
    association_nationality VARCHAR(100),
    association_passport_number VARCHAR(50),
    association_id_card_number VARCHAR(50),
    association_place_of_work VARCHAR(255),
    association_gender VARCHAR(10) CHECK (association_gender IN ('male', 'female')),
    association_reason TEXT,
    association_company_name VARCHAR(255),
    association_registration_address TEXT,
    association_business_type VARCHAR(100),
    association_other_particulars TEXT,
    
    -- Person Being Reported
    person_involvement VARCHAR(20) CHECK (person_involvement IN ('individual', 'other')),
    person_first_name VARCHAR(100),
    person_middle_name VARCHAR(100),
    person_last_name VARCHAR(100),
    person_other_name VARCHAR(100),
    person_identification_type VARCHAR(20) CHECK (person_identification_type IN ('known', 'unknown')),
    person_residence_id VARCHAR(50),
    person_other_id VARCHAR(50),
    person_birth_date DATE,
    person_gender VARCHAR(10) CHECK (person_gender IN ('male', 'female')),
    person_passport_number VARCHAR(50),
    person_passport_issuing_country VARCHAR(100),
    person_country_of_residence VARCHAR(100),
    person_country_of_origin VARCHAR(100),
    person_occupation VARCHAR(100),
    
    -- Entity/Individual Details
    entity_full_name VARCHAR(255),
    entity_business_type VARCHAR(100),
    entity_registration_number VARCHAR(100),
    entity_tax_id VARCHAR(50),
    entity_issuing_country VARCHAR(100),
    entity_address_type VARCHAR(20) CHECK (entity_address_type IN ('known', 'unknown')),
    entity_country VARCHAR(100),
    entity_state_region VARCHAR(100),
    entity_subcity_zone VARCHAR(100),
    entity_woreda VARCHAR(100),
    entity_town VARCHAR(100),
    entity_kebele VARCHAR(100),
    entity_house_number VARCHAR(50),
    entity_postal_address VARCHAR(255),
    entity_email VARCHAR(255),
    
    -- Representative Details
    representative_first_name VARCHAR(100),
    representative_middle_name VARCHAR(100),
    representative_last_name VARCHAR(100),
    representative_birth_date DATE,
    representative_passport_number VARCHAR(50),
    representative_issuing_country VARCHAR(100),
    representative_business_mobile VARCHAR(20),
    representative_business_contact VARCHAR(20),
    representative_business_fax VARCHAR(20),
    representative_residential_contact VARCHAR(20),
    representative_email VARCHAR(255),
    
    -- Suspicious Activity
    suspicious_reason TEXT NOT NULL,
    crime_type_id UUID REFERENCES crime_types(id),
    
    -- Additional Information
    additional_information TEXT,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for str_reports
CREATE INDEX idx_str_reports_number ON str_reports(report_number);
CREATE INDEX idx_str_reports_status ON str_reports(status);
CREATE INDEX idx_str_reports_transaction_date ON str_reports(transaction_date_time);
CREATE INDEX idx_str_reports_crime_type ON str_reports(crime_type_id);
CREATE INDEX idx_str_reports_created_by ON str_reports(created_by);
CREATE INDEX idx_str_reports_branch ON str_reports(transaction_branch_id);

-- Create trigger for updated_at
CREATE TRIGGER update_str_reports_updated_at BEFORE UPDATE ON str_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
