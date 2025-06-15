-- Create workflow_history table for tracking report status changes
CREATE TABLE IF NOT EXISTS workflow_history (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL,
    report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('STR', 'CTR')),
    action VARCHAR(50) NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED')),
    action_by INTEGER NOT NULL REFERENCES users(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for workflow_history
CREATE INDEX IF NOT EXISTS idx_workflow_history_report ON workflow_history(report_id, report_type);
CREATE INDEX IF NOT EXISTS idx_workflow_history_action_by ON workflow_history(action_by);
CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON workflow_history(created_at);

-- Add comments
COMMENT ON TABLE workflow_history IS 'Tracks all workflow actions performed on reports';
COMMENT ON COLUMN workflow_history.report_id IS 'ID of the report (STR or CTR)';
COMMENT ON COLUMN workflow_history.report_type IS 'Type of report (STR or CTR)';
COMMENT ON COLUMN workflow_history.action IS 'Action performed on the report';
COMMENT ON COLUMN workflow_history.action_by IS 'User who performed the action';
COMMENT ON COLUMN workflow_history.comments IS 'Optional comments for the action';
