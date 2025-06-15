-- Report Attachments table for file uploads
CREATE TABLE report_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    str_report_id UUID REFERENCES str_reports(id) ON DELETE CASCADE,
    ctr_report_id UUID REFERENCES ctr_reports(id) ON DELETE CASCADE,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100),
    
    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_report_attachment_type CHECK (
        (str_report_id IS NOT NULL AND ctr_report_id IS NULL) OR
        (str_report_id IS NULL AND ctr_report_id IS NOT NULL)
    )
);

-- Create indexes for report_attachments
CREATE INDEX idx_report_attachments_str ON report_attachments(str_report_id);
CREATE INDEX idx_report_attachments_ctr ON report_attachments(ctr_report_id);
CREATE INDEX idx_report_attachments_uploaded_by ON report_attachments(uploaded_by);
CREATE INDEX idx_report_attachments_uploaded_at ON report_attachments(uploaded_at);
