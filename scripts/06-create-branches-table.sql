-- Branches table (Intermediate Admin manages)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(20) UNIQUE,
    reporting_entity_id UUID NOT NULL REFERENCES reporting_entities(id) ON DELETE CASCADE,
    
    -- Address Information
    address_type VARCHAR(20) DEFAULT 'known' CHECK (address_type IN ('known', 'unknown', 'other')),
    country VARCHAR(100),
    state_region VARCHAR(100),
    city_town VARCHAR(100),
    subcity_zone VARCHAR(100),
    woreda VARCHAR(100),
    kebele VARCHAR(100),
    house_number VARCHAR(50),
    postal_address VARCHAR(255),
    
    -- Contact Information
    phone_number VARCHAR(20),
    email VARCHAR(255),
    fax_number VARCHAR(20),
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for branches
CREATE INDEX idx_branches_name ON branches(branch_name);
CREATE INDEX idx_branches_code ON branches(branch_code);
CREATE INDEX idx_branches_entity ON branches(reporting_entity_id);
CREATE INDEX idx_branches_active ON branches(is_active);
CREATE INDEX idx_branches_created_by ON branches(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
