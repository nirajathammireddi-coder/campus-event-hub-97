import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Building2, ExternalLink, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, useToggleBookmark } from "@/hooks/useBookmarks";
import { useEventLikes, useToggleLike } from "@/hooks/useEventLikes";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/hooks/useEvents";

const typeColors: Record<string, string> = {
  hackathon: "bg-event-hackathon text-primary-foreground",
  workshop: "bg-event-workshop text-accent-foreground",
  seminar: "bg-event-seminar text-accent-foreground",
  fest: "bg-event-fest text-primary-foreground",
};

export function EventCard({ event }: { event: Event }) {
  const { user } = useAuth();
  const { data: bookmarkIds } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const { data: likes } = useEventLikes(event.id);
  const toggleLike = useToggleLike();
  const { toast } = useToast();

  const isBookmarked = bookmarkIds?.includes(event.id) ?? false;

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast({ title: "Sign in to bookmark events" });
    toggleBookmark.mutate({ eventId: event.id, isBookmarked });
  };

  const handleLike = (e: React.MouseEvent, isLike: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast({ title: "Sign in to rate events" });
    toggleLike.mutate({ eventId: event.id, isLike });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/event/${event.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  return (
    <Link to={`/event/${event.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 gradient-card">
        {event.image_url && (
          <div className="h-44 overflow-hidden">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${typeColors[event.event_type]} text-xs font-medium`}>{event.event_type}</Badge>
              {event.audience_type !== "public" && (
                <Badge variant="outline" className="text-xs">{event.audience_type}</Badge>
              )}
            </div>
            <button onClick={handleBookmark} className="text-muted-foreground hover:text-primary transition-colors">
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </button>
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
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.city}</span>
            )}
            {event.college && (
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{event.college}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <button onClick={(e) => handleLike(e, true)} className={`flex items-center gap-1 text-xs ${likes?.userReaction === true ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"} transition-colors`}>
                <ThumbsUp className="h-3.5 w-3.5" /> {likes?.likes ?? 0}
              </button>
              <button onClick={(e) => handleLike(e, false)} className={`flex items-center gap-1 text-xs ${likes?.userReaction === false ? "text-destructive font-medium" : "text-muted-foreground hover:text-destructive"} transition-colors`}>
                <ThumbsDown className="h-3.5 w-3.5" /> {likes?.dislikes ?? 0}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="h-3.5 w-3.5" />
              </button>
              {event.registration_link && (
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <ExternalLink className="h-3 w-3" /> Register
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
