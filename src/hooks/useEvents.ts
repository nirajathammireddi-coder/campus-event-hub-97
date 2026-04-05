import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_type: "hackathon" | "workshop" | "seminar" | "fest";
  college: string | null;
  department: string | null;
  city: string | null;
  date: string;
  time: string | null;
  image_url: string | null;
  registration_link: string | null;
  status: "pending" | "approved";
  audience_type: "public" | "college" | "department";
  target_college: string | null;
  target_department: string | null;
  created_by: string | null;
  created_at: string;
};

interface EventFilters {
  search?: string;
  city?: string;
  college?: string;
  department?: string;
  eventType?: string;
}

export function useEvents(filters: EventFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["events", filters, profile],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("date", { ascending: true });

      if (filters.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters.college) query = query.ilike("college", `%${filters.college}%`);
      if (filters.department) query = query.ilike("department", `%${filters.department}%`);
      if (filters.eventType) query = query.eq("event_type", filters.eventType as Event["event_type"]);
      if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;

      // Client-side audience filtering
      return (data as Event[]).filter((event) => {
        if (event.audience_type === "public") return true;
        if (event.audience_type === "college" && profile?.college) {
          return event.target_college?.toLowerCase() === profile.college.toLowerCase();
        }
        if (event.audience_type === "department" && profile?.department) {
          return (
            event.target_department?.toLowerCase() === profile.department.toLowerCase() &&
            event.target_college?.toLowerCase() === profile?.college?.toLowerCase()
          );
        }
        return false;
      });
    },
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
  });
}
