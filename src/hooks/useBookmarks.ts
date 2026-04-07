import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookmarks")
        .select("event_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((b) => b.event_id);
    },
    enabled: !!user,
  });
}

export function useToggleBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isBookmarked }: { eventId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("event_id", eventId);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, event_id: eventId });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}
