import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type EventPhoto = {
  id: string;
  event_id: string;
  uploaded_by: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export function useEventPhotos(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", eventId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventPhoto[];
    },
    enabled: !!eventId,
  });
}

export function useUploadEventPhoto(eventId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      if (!user) throw new Error("Must be logged in");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${eventId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("event-photos")
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from("event_photos").insert({
        event_id: eventId,
        uploaded_by: user.id,
        image_url: urlData.publicUrl,
        caption: caption || null,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-photos", eventId] });
    },
  });
}
