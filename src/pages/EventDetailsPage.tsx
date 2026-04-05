import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Building2, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import type { Event } from "@/hooks/useEvents";

const typeColors: Record<string, string> = {
  hackathon: "bg-event-hackathon text-primary-foreground",
  workshop: "bg-event-workshop text-accent-foreground",
  seminar: "bg-event-seminar text-accent-foreground",
  fest: "bg-event-fest text-primary-foreground",
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10">
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-20 text-center text-muted-foreground">
        <p className="text-lg">Event not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to events</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>

        {event.image_url && (
          <div className="rounded-xl overflow-hidden mb-6 h-64 md:h-80">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${typeColors[event.event_type]}`}>{event.event_type}</Badge>
            {event.audience_type !== "public" && (
              <Badge variant="outline">{event.audience_type}</Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            {event.time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {event.time}
              </span>
            )}
            {event.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.city}
              </span>
            )}
            {event.college && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {event.college}
                {event.department && ` — ${event.department}`}
              </span>
            )}
          </div>

          {event.description && (
            <div className="prose prose-sm max-w-none text-foreground/80 pt-4 whitespace-pre-line">
              {event.description}
            </div>
          )}

          {event.registration_link && (
            <Button className="mt-6" asChild>
              <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Register Now
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
