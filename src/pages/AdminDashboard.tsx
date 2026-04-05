import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminEvents } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2, Plus } from "lucide-react";

type AudienceType = "public" | "college" | "department";
type EventType = "hackathon" | "workshop" | "seminar" | "fest";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useAdminEvents();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", event_type: "workshop" as EventType,
    college: "", department: "", city: "", date: "", time: "",
    image_url: "", registration_link: "",
    audience_type: "public" as AudienceType, target_college: "", target_department: "",
  });

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert({
        ...form,
        created_by: user.id,
        status: "approved",
      });
      if (error) throw error;
      toast({ title: "Event created!" });
      setShowForm(false);
      setForm({ title: "", description: "", event_type: "workshop", college: "", department: "", city: "", date: "", time: "", image_url: "", registration_link: "", audience_type: "public", target_college: "", target_department: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (id: string) => {
    await supabase.from("events").update({ status: "approved" }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast({ title: "Event approved!" });
  };

  const rejectEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    toast({ title: "Event rejected and removed." });
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast({ title: "Event deleted." });
  };

  const pending = events?.filter((e) => e.status === "pending") ?? [];
  const approved = events?.filter((e) => e.status === "approved") ?? [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Create Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    <Label>Date *</Label>
                    <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Image URL</Label>
                    <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} />
                  </div>
                  <div>
                    <Label>Registration Link</Label>
                    <Input value={form.registration_link} onChange={(e) => update("registration_link", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Audience</Label>
                    <Select value={form.audience_type} onValueChange={(v) => update("audience_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="college">College Only</SelectItem>
                        <SelectItem value="department">Department Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(form.audience_type === "college" || form.audience_type === "department") && (
                    <div>
                      <Label>Target College</Label>
                      <Input value={form.target_college} onChange={(e) => update("target_college", e.target.value)} />
                    </div>
                  )}
                  {form.audience_type === "department" && (
                    <div>
                      <Label>Target Department</Label>
                      <Input value={form.target_department} onChange={(e) => update("target_department", e.target.value)} />
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Event (Approved)"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pending.length === 0 && <p className="text-muted-foreground text-sm py-8 text-center">No pending events.</p>}
            {pending.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.college && `${event.college} · `}{event.city && `${event.city} · `}{new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => approveEvent(event.id)}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectEvent(event.id)}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-3 mt-4">
            {isLoading && <div className="h-20 bg-muted animate-pulse rounded-lg" />}
            {approved.length === 0 && !isLoading && <p className="text-muted-foreground text-sm py-8 text-center">No approved events.</p>}
            {approved.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">{event.event_type}</Badge>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.college && `${event.college} · `}{event.city && `${event.city} · `}{new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
