-- Create the team_profiles table
CREATE TABLE IF NOT EXISTS public.team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive'
);

-- Create the team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  team_id UUID NOT NULL REFERENCES public.team_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'invited',
  CONSTRAINT team_members_email_user_constraint CHECK (
    (user_id IS NOT NULL AND invited_email IS NULL) OR
    (user_id IS NULL AND invited_email IS NOT NULL)
  )
);

-- Create RLS policies for team_profiles
ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team owners can create teams" ON public.team_profiles
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can view their teams" ON public.team_profiles
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON public.team_profiles
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON public.team_profiles
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Create RLS policies for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team owners can manage team members" ON public.team_members
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT id FROM public.team_profiles WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view their own team" ON public.team_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT id FROM public.team_profiles WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX team_profiles_owner_id_idx ON public.team_profiles (owner_id);
CREATE INDEX team_members_team_id_idx ON public.team_members (team_id);
CREATE INDEX team_members_user_id_idx ON public.team_members (user_id);
CREATE INDEX team_members_invited_email_idx ON public.team_members (invited_email); 