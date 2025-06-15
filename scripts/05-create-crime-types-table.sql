-- Crime Types table (Super Admin manages)
CREATE TABLE crime_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crime_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for crime_types
CREATE INDEX idx_crime_types_name ON crime_types(crime_name);
CREATE INDEX idx_crime_types_severity ON crime_types(severity_level);
CREATE INDEX idx_crime_types_active ON crime_types(is_active);
CREATE INDEX idx_crime_types_created_by ON crime_types(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_crime_types_updated_at BEFORE UPDATE ON crime_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
