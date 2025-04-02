-- Create policy_versions table
CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    policy_type TEXT NOT NULL,
    template TEXT NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_policy_versions_user_id ON policy_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_versions_created_at ON policy_versions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own policy versions
CREATE POLICY "Users can only access their own policy versions"
    ON policy_versions
    FOR ALL
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_policy_versions_updated_at
    BEFORE UPDATE ON policy_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 