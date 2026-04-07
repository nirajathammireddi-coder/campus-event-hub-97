import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useBookmarkedEvents } from "@/hooks/useBookmarkedEvents";
import { EventCard } from "@/components/EventCard";
import { Bookmark, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    college: profile?.college || "",
    department: profile?.department || "",
    city: profile?.city || "",
  });
  const { data: bookmarkedEvents } = useBookmarkedEvents();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" /> Saved Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Your Profile</CardTitle>
                <p className="text-muted-foreground text-sm">Set your college and department to see relevant events.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
                  <div><Label>College</Label><Input value={form.college} onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))} placeholder="e.g. GITAM University" /></div>
                  <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science" /></div>
                  <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g. Vizag" /></div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks">
            {bookmarkedEvents?.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-display">No saved events</p>
                <p className="text-sm mt-1">Bookmark events to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedEvents?.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
