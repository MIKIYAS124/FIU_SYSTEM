-- Migration: Rename 'name' column to 'type' in transaction_manners table
EXEC sp_rename 'transaction_manners.name', 'type', 'COLUMN';