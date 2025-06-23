-- Migration: Rename 'name' column to 'type' in crime_types table
EXEC sp_rename 'crime_types.name', 'type', 'COLUMN';