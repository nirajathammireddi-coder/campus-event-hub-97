import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, MapPin, Building2, Clock, ArrowLeft, ExternalLink, Camera, User, Phone, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEventPhotos, useUploadEventPhoto } from "@/hooks/useEventPhotos";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/hooks/useEvents";

const typeColors: Record<string, string> = {
  hackathon: "bg-event-hackathon text-primary-foreground",
  workshop: "bg-event-workshop text-accent-foreground",
  seminar: "bg-event-seminar text-accent-foreground",
  fest: "bg-event-fest text-primary-foreground",
};

function formatDateRange(start: string, end: string | null) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  if (!end || end === start) return s;
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return `${s} — ${e}`;
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  const { data: photos } = useEventPhotos(id);
  const uploadMutation = useUploadEventPhoto(id || "");

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ file, caption });
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: "Photo uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const deletePhoto = async (photoId: string, imageUrl: string) => {
    const path = imageUrl.split("/event-photos/")[1];
    if (path) await supabase.storage.from("event-photos").remove([path]);
    await supabase.from("event_photos").delete().eq("id", photoId);
    toast({ title: "Photo removed" });
  };

  if (isLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-10"><div className="h-96 rounded-xl bg-muted animate-pulse" /></div>
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
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDateRange(event.date, event.end_date)}
            </span>
            {event.time && (
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{event.time}</span>
            )}
            {event.city && (
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.city}</span>
            )}
            {event.college && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {event.college}{event.department && ` — ${event.department}`}
              </span>
            )}
          </div>

          {event.description && (
            <div className="prose prose-sm max-w-none text-foreground/80 pt-4 whitespace-pre-line">
              {event.description}
            </div>
          )}

          {/* Submitter Contact */}
          {(event.submitter_name || event.submitter_email || event.submitter_phone) && (
            <div className="border rounded-lg p-4 mt-4 space-y-2 bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Posted by</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {event.submitter_name && (
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{event.submitter_name}</span>
                )}
                {event.submitter_college && (
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{event.submitter_college}</span>
                )}
                {event.submitter_phone && (
                  <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{event.submitter_phone}</span>
                )}
                {event.submitter_email && (
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{event.submitter_email}</span>
                )}
              </div>
            </div>
          )}

          {event.registration_link && (
            <Button className="mt-6" asChild>
              <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Register Now
              </a>
            </Button>
          )}

          {/* Photo Gallery */}
          <div className="pt-8 space-y-4">
            <h2 className="font-display font-bold text-xl">Photos</h2>

            {user && (
              <div className="flex items-end gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex-1 space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground file:text-sm file:cursor-pointer" />
                  <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption (optional)" className="text-sm" />
                </div>
                <Button size="sm" onClick={handleUpload} disabled={uploadMutation.isPending}>
                  <Camera className="h-4 w-4 mr-1" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            )}

            {photos && photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-lg overflow-hidden">
                    <img src={photo.image_url} alt={photo.caption || "Event photo"} className="w-full h-40 object-cover" />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">{photo.caption}</div>
                    )}
                    {user?.id === photo.uploaded_by && (
                      <button
                        onClick={() => deletePhoto(photo.id, photo.image_url)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No photos yet. Be the first to share one!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
