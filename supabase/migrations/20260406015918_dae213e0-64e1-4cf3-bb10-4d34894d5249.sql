
-- Add new columns to events
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS submitter_name text,
  ADD COLUMN IF NOT EXISTS submitter_phone text,
  ADD COLUMN IF NOT EXISTS submitter_email text,
  ADD COLUMN IF NOT EXISTS submitter_college text;

-- Set default status to approved (auto-approve)
ALTER TABLE public.events ALTER COLUMN status SET DEFAULT 'approved'::event_status;

-- Drop old admin-centric RLS policies
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view approved events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can submit events" ON public.events;

-- New open RLS policies
CREATE POLICY "Anyone can view approved events" ON public.events
  FOR SELECT USING (status = 'approved'::event_status);

CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Create event_photos table
CREATE TABLE public.event_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event photos" ON public.event_photos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload photos" ON public.event_photos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own photos" ON public.event_photos
  FOR DELETE TO authenticated
  USING (auth.uid() = uploaded_by);

-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true);

CREATE POLICY "Anyone can view event photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-photos');

CREATE POLICY "Authenticated users can upload event photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Users can delete own event photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'event-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
