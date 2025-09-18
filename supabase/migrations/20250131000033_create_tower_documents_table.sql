-- Create tower_documents table
CREATE TABLE IF NOT EXISTS tower_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tower_id UUID NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE tower_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view documents for their towers" ON tower_documents
    FOR SELECT USING (
        tower_id IN (
            SELECT id FROM towers 
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their towers" ON tower_documents
    FOR INSERT WITH CHECK (
        tower_id IN (
            SELECT id FROM towers 
            WHERE teacher_id = auth.uid()
        ) AND teacher_id = auth.uid()
    );

CREATE POLICY "Users can update documents for their towers" ON tower_documents
    FOR UPDATE USING (
        tower_id IN (
            SELECT id FROM towers 
            WHERE teacher_id = auth.uid()
        ) AND teacher_id = auth.uid()
    );

CREATE POLICY "Users can delete documents for their towers" ON tower_documents
    FOR DELETE USING (
        tower_id IN (
            SELECT id FROM towers 
            WHERE teacher_id = auth.uid()
        ) AND teacher_id = auth.uid()
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tower_documents_tower_id ON tower_documents(tower_id);
CREATE INDEX IF NOT EXISTS idx_tower_documents_teacher_id ON tower_documents(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tower_documents_created_at ON tower_documents(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tower_documents_updated_at 
    BEFORE UPDATE ON tower_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
