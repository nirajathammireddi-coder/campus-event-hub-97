import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Event } from "@/hooks/useEvents";

export function useBookmarkedEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookmarked-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: bookmarks, error: bErr } = await supabase
        .from("bookmarks")
        .select("event_id")
        .eq("user_id", user.id);
      if (bErr) throw bErr;
      if (!bookmarks.length) return [];

      const ids = bookmarks.map((b) => b.event_id);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", ids)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });
}
