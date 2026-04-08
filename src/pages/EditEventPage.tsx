import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/hooks/useEvents";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "workshop",
    college: "",
    department: "",
    city: "",
    date: "",
    end_date: "",
    time: "",
    image_url: "",
    registration_link: "",
    instagram_link: "",
    youtube_link: "",
    whatsapp_link: "",
    website_link: "",
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        event_type: event.event_type || "workshop",
        college: event.college || "",
        department: event.department || "",
        city: event.city || "",
        date: event.date || "",
        end_date: event.end_date || "",
        time: event.time || "",
        image_url: event.image_url || "",
        registration_link: event.registration_link || "",
        instagram_link: event.instagram_link || "",
        youtube_link: event.youtube_link || "",
        whatsapp_link: event.whatsapp_link || "",
        website_link: event.website_link || "",
      });
    }
  }, [event]);

  if (!user) { navigate("/auth"); return null; }

  if (isLoading) return (
    <div className="min-h-screen"><Navbar /><div className="container py-10"><div className="h-96 rounded-xl bg-muted animate-pulse" /></div></div>
  );

  if (!event || event.created_by !== user.id) return (
    <div className="min-h-screen"><Navbar />
      <div className="container py-20 text-center text-muted-foreground">
        <p>You can only edit your own events.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("events").update({
        title: form.title,
        description: form.description || null,
        event_type: form.event_type as Event["event_type"],
        college: form.college || null,
        department: form.department || null,
        city: form.city || null,
        date: form.date,
        end_date: form.end_date || null,
        time: form.time || null,
        image_url: form.image_url || null,
        registration_link: form.registration_link || null,
        instagram_link: form.instagram_link || null,
        youtube_link: form.youtube_link || null,
        whatsapp_link: form.whatsapp_link || null,
        website_link: form.website_link || null,
      }).eq("id", id!);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event updated!" });
      navigate(`/event/${id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Event Title *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <Select value={form.event_type} onValueChange={(v) => update("event_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="fest">Fest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} min={form.date} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div>
                  <Label>College</Label>
                  <Input value={form.college} onChange={(e) => update("college", e.target.value)} />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(e) => update("department", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Registration Link</Label>
                <Input value={form.registration_link} onChange={(e) => update("registration_link", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Social Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Instagram</Label>
                    <Input value={form.instagram_link} onChange={(e) => update("instagram_link", e.target.value)} />
                  </div>
                  <div>
                    <Label>YouTube</Label>
                    <Input value={form.youtube_link} onChange={(e) => update("youtube_link", e.target.value)} />
                  </div>
                  <div>
                    <Label>WhatsApp Group</Label>
                    <Input value={form.whatsapp_link} onChange={(e) => update("whatsapp_link", e.target.value)} />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={form.website_link} onChange={(e) => update("website_link", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
