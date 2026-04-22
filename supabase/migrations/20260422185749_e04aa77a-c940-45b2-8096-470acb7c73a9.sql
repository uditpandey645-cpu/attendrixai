
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Anyone can insert profiles"
  ON public.profiles FOR INSERT WITH CHECK (true);

-- Face embeddings table - stores 128-d descriptor as float array
CREATE TABLE public.face_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding REAL[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_face_embeddings_profile ON public.face_embeddings(profile_id);

ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Embeddings are viewable by everyone"
  ON public.face_embeddings FOR SELECT USING (true);

CREATE POLICY "Anyone can insert embeddings"
  ON public.face_embeddings FOR INSERT WITH CHECK (true);

-- Attendance records
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  confidence REAL NOT NULL,
  UNIQUE(profile_id, attendance_date)
);

CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date DESC);
CREATE INDEX idx_attendance_profile ON public.attendance_records(profile_id);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance records are viewable by everyone"
  ON public.attendance_records FOR SELECT USING (true);

CREATE POLICY "Anyone can insert attendance records"
  ON public.attendance_records FOR INSERT WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
