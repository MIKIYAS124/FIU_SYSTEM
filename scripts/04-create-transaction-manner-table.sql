-- Transaction Manner table (Super Admin manages)
CREATE TABLE transaction_manner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manner_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transaction_manner
CREATE INDEX idx_transaction_manner_name ON transaction_manner(manner_name);
CREATE INDEX idx_transaction_manner_active ON transaction_manner(is_active);
CREATE INDEX idx_transaction_manner_created_by ON transaction_manner(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_transaction_manner_updated_at BEFORE UPDATE ON transaction_manner
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
