-- Allow updates/deletes for editable dashboard
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Anyone can update embeddings" ON public.face_embeddings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete embeddings" ON public.face_embeddings FOR DELETE USING (true);

CREATE POLICY "Anyone can update attendance records" ON public.attendance_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete attendance records" ON public.attendance_records FOR DELETE USING (true);

-- Prevent duplicate attendance per user per day (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_records_profile_date_unique'
  ) THEN
    ALTER TABLE public.attendance_records
      ADD CONSTRAINT attendance_records_profile_date_unique UNIQUE (profile_id, attendance_date);
  END IF;
END $$;

-- Index for fast date-range queries
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records (attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_records_marked_at ON public.attendance_records (marked_at DESC);

-- Enable realtime on attendance_records and profiles
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'attendance_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;