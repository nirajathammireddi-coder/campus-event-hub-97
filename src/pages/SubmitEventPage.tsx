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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Mail } from "lucide-react";

export default function SubmitEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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
    instagram_link: "",
    youtube_link: "",
    whatsapp_link: "",
    website_link: "",
    audience_type: "public" as "public" | "college" | "department",
    target_college: "",
    target_department: "",
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const sendOtp = async () => {
    if (!form.submitter_email) return toast({ title: "Enter your email first" });
    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: form.submitter_email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      setOtpSent(true);
      toast({ title: "OTP sent!", description: "Check your email for the verification code." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length < 6) return;
    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: form.submitter_email,
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      setEmailVerified(true);
      toast({ title: "Email verified!" });
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified) return toast({ title: "Please verify your email first" });
    setLoading(true);
    try {
      const { error } = await supabase.from("events").insert({
        title: form.title,
        description: form.description || null,
        event_type: form.event_type,
        college: form.college || null,
        department: form.department || null,
        city: form.city || null,
        date: form.date,
        end_date: form.end_date || null,
        time: form.time || null,
        image_url: form.image_url || null,
        registration_link: form.registration_link || null,
        submitter_name: form.submitter_name,
        submitter_phone: form.submitter_phone,
        submitter_email: form.submitter_email,
        submitter_college: form.submitter_college,
        created_by: user.id,
        status: "approved",
        audience_type: form.audience_type,
        target_college: form.audience_type !== "public" ? form.target_college || null : null,
        target_department: form.audience_type === "department" ? form.target_department || null : null,
        instagram_link: form.instagram_link || null,
        youtube_link: form.youtube_link || null,
        whatsapp_link: form.whatsapp_link || null,
        website_link: form.website_link || null,
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
            <p className="text-muted-foreground text-sm">Share your event with students across campuses.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email OTP Verification */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Verification
                  {emailVerified && <CheckCircle className="h-4 w-4 text-accent" />}
                </h3>
                {!emailVerified ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={form.submitter_email}
                        onChange={(e) => update("submitter_email", e.target.value)}
                        required
                        placeholder="you@email.com"
                        type="email"
                        disabled={otpSent}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={sendOtp} disabled={verifyingOtp || otpSent}>
                        {otpSent ? "Sent" : "Send OTP"}
                      </Button>
                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email</Label>
                        <div className="flex items-center gap-3">
                          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                          <Button type="button" size="sm" onClick={verifyOtp} disabled={verifyingOtp || otpCode.length < 6}>
                            Verify
                          </Button>
                        </div>
                        <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="text-xs text-primary underline">
                          Resend / Change email
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{form.submitter_email} — verified ✓</p>
                )}
              </div>

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
                <div>
                  <Label>Phone *</Label>
                  <Input value={form.submitter_phone} onChange={(e) => update("submitter_phone", e.target.value)} required placeholder="9876543210" type="tel" />
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

              {/* Audience */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Who can see this event?</h3>
                <Select value={form.audience_type} onValueChange={(v) => update("audience_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (all users)</SelectItem>
                    <SelectItem value="college">Specific College</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                  </SelectContent>
                </Select>
                {form.audience_type !== "public" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target College</Label>
                      <Input value={form.target_college} onChange={(e) => update("target_college", e.target.value)} placeholder="College name" />
                    </div>
                    {form.audience_type === "department" && (
                      <div>
                        <Label>Target Department</Label>
                        <Input value={form.target_department} onChange={(e) => update("target_department", e.target.value)} placeholder="Department name" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Registration Link</Label>
                <Input value={form.registration_link} onChange={(e) => update("registration_link", e.target.value)} placeholder="https://..." />
              </div>

              {/* Social Links */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Social Links (optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Instagram</Label>
                    <Input value={form.instagram_link} onChange={(e) => update("instagram_link", e.target.value)} placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <Label>YouTube</Label>
                    <Input value={form.youtube_link} onChange={(e) => update("youtube_link", e.target.value)} placeholder="https://youtube.com/..." />
                  </div>
                  <div>
                    <Label>WhatsApp Group</Label>
                    <Input value={form.whatsapp_link} onChange={(e) => update("whatsapp_link", e.target.value)} placeholder="https://chat.whatsapp.com/..." />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={form.website_link} onChange={(e) => update("website_link", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !emailVerified}>
                {loading ? "Posting..." : "Post Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
