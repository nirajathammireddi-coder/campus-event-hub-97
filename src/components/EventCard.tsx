import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Building2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Event } from "@/hooks/useEvents";

const typeColors: Record<string, string> = {
  hackathon: "bg-event-hackathon text-primary-foreground",
  workshop: "bg-event-workshop text-accent-foreground",
  seminar: "bg-event-seminar text-accent-foreground",
  fest: "bg-event-fest text-primary-foreground",
};

export function EventCard({ event }: { event: Event }) {
  return (
    <Link to={`/event/${event.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 gradient-card">
        {event.image_url && (
          <div className="h-44 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${typeColors[event.event_type]} text-xs font-medium`}>
              {event.event_type}
            </Badge>
            {event.audience_type !== "public" && (
              <Badge variant="outline" className="text-xs">
                {event.audience_type}
              </Badge>
            )}
          </div>
          <h3 className="font-display font-semibold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {event.end_date && event.end_date !== event.date && (
                <> — {new Date(event.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
              )}
            </span>
            {event.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.city}
              </span>
            )}
            {event.college && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {event.college}
              </span>
            )}
          </div>
          {event.registration_link && (
            <div className="flex items-center gap-1 text-xs text-primary font-medium pt-1">
              <ExternalLink className="h-3 w-3" />
              Register
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
