import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type LikeCounts = { likes: number; dislikes: number; userReaction: boolean | null };

export function useEventLikes(eventId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["event-likes", eventId, user?.id],
    queryFn: async (): Promise<LikeCounts> => {
      if (!eventId) return { likes: 0, dislikes: 0, userReaction: null };
      const { data, error } = await supabase
        .from("event_likes")
        .select("is_like, user_id")
        .eq("event_id", eventId);
      if (error) throw error;

      const likes = data.filter((r) => r.is_like).length;
      const dislikes = data.filter((r) => !r.is_like).length;
      const userRow = user ? data.find((r) => r.user_id === user.id) : undefined;
      return { likes, dislikes, userReaction: userRow ? userRow.is_like : null };
    },
    enabled: !!eventId,
  });
}

export function useToggleLike() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isLike }: { eventId: string; isLike: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      // Check existing
      const { data: existing } = await supabase
        .from("event_likes")
        .select("id, is_like")
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .maybeSingle();

      if (existing) {
        if (existing.is_like === isLike) {
          // Remove reaction
          await supabase.from("event_likes").delete().eq("id", existing.id);
        } else {
          // Toggle
          await supabase.from("event_likes").update({ is_like: isLike }).eq("id", existing.id);
        }
      } else {
        await supabase.from("event_likes").insert({ user_id: user.id, event_id: eventId, is_like: isLike });
      }
    },
    onSuccess: (_, { eventId }) => qc.invalidateQueries({ queryKey: ["event-likes", eventId] }),
  });
}
