import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, X, CalendarDays } from "lucide-react";
import { useNotifications, markNotificationRead } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { data: notifications } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNotificationClick = async (n: { id: string; is_read: boolean; event_id: string | null }) => {
    if (!n.is_read) {
      await markNotificationRead(n.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    if (n.event_id) navigate(`/event/${n.event_id}`);
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-display font-bold text-xl text-foreground flex items-center gap-2">
          <span className="gradient-hero bg-clip-text text-transparent">Campus</span>
          <span>Event Alert</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/submit-event">Post Event</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/calendar"><CalendarDays className="h-4 w-4 mr-1" />Calendar</Link>
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        {unread}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b">
                    <h4 className="font-display font-semibold text-sm">Notifications</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.length === 0 && (
                      <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
                    )}
                    {notifications?.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${n.is_read ? "opacity-60" : ""}`}
                      >
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.message && <p className="text-xs text-muted-foreground mt-1">{n.message}</p>}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t p-4 space-y-2 glass-effect">
          {user ? (
            <>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/submit-event">Post Event</Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/calendar"><CalendarDays className="h-4 w-4 mr-2" />Calendar</Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" className="w-full" asChild onClick={() => setMobileOpen(false)}>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
