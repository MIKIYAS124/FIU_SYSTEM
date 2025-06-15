-- Reporting Entities table (Super Admin manages)
CREATE TABLE reporting_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    issuing_country VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    country_of_origin VARCHAR(100) NOT NULL,
    
    -- Address Information
    country VARCHAR(100) NOT NULL,
    state_region VARCHAR(100),
    city_town VARCHAR(100),
    subcity_zone VARCHAR(100),
    woreda VARCHAR(100),
    kebele VARCHAR(100),
    house_number VARCHAR(50),
    postal_address VARCHAR(255),
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reporting_entities
CREATE INDEX idx_reporting_entities_tax_id ON reporting_entities(tax_id);
CREATE INDEX idx_reporting_entities_status ON reporting_entities(status);
CREATE INDEX idx_reporting_entities_country ON reporting_entities(country);
CREATE INDEX idx_reporting_entities_created_by ON reporting_entities(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_reporting_entities_updated_at BEFORE UPDATE ON reporting_entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
