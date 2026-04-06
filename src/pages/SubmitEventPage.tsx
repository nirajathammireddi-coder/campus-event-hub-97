import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function SubmitEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "workshop" as const,
    college: "",
    department: "",
    city: "",
    date: "",
    end_date: "",
    time: "",
    image_url: "",
    registration_link: "",
    submitter_name: "",
    submitter_phone: "",
    submitter_email: "",
    submitter_college: "",
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert({
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        college: form.college,
        department: form.department,
        city: form.city,
        date: form.date,
        end_date: form.end_date || null,
        time: form.time,
        image_url: form.image_url || null,
        registration_link: form.registration_link || null,
        submitter_name: form.submitter_name,
        submitter_phone: form.submitter_phone,
        submitter_email: form.submitter_email,
        submitter_college: form.submitter_college,
        created_by: user.id,
        status: "approved",
        audience_type: "public",
      });
      if (error) throw error;
      toast({ title: "Event posted!", description: "Your event is now live." });
      navigate("/");
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
            <CardTitle className="font-display text-2xl">Post an Event</CardTitle>
            <p className="text-muted-foreground text-sm">Share your event with students across campuses. It will be live immediately!</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Submitter Info */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Your Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Your Name *</Label>
                    <Input value={form.submitter_name} onChange={(e) => update("submitter_name", e.target.value)} required placeholder="Full name" />
                  </div>
                  <div>
                    <Label>Your College *</Label>
                    <Input value={form.submitter_college} onChange={(e) => update("submitter_college", e.target.value)} required placeholder="College name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone *</Label>
                    <Input value={form.submitter_phone} onChange={(e) => update("submitter_phone", e.target.value)} required placeholder="9876543210" type="tel" />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input value={form.submitter_email} onChange={(e) => update("submitter_email", e.target.value)} required placeholder="you@email.com" type="email" />
                  </div>
                </div>
              </div>

              {/* Event Details */}
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
                  <Label>End Date (if multi-day)</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} min={form.date} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Vizag" />
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Posting..." : "Post Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
