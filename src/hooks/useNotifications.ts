import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Notification = {
  id: string;
  title: string;
  message: string | null;
  event_id: string | null;
  is_read: boolean;
  created_at: string;
};

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
}

export async function markNotificationRead(id: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}
