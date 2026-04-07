
-- Drop the old admin-only insert policy
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

-- Allow the trigger function (security definer) to insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create a function that notifies all users when a new event is created
CREATE OR REPLACE FUNCTION public.notify_users_on_new_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, event_id)
  SELECT 
    p.user_id,
    'New Event: ' || NEW.title,
    COALESCE(NEW.college, '') || ' — ' || NEW.event_type || ' on ' || NEW.date::text,
    NEW.id
  FROM public.profiles p
  WHERE p.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid);
  
  RETURN NEW;
END;
$$;

-- Create trigger on events table
CREATE TRIGGER on_event_created_notify
AFTER INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.notify_users_on_new_event();
