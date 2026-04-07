import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const typeColors: Record<string, string> = {
  hackathon: "bg-event-hackathon text-primary-foreground",
  workshop: "bg-event-workshop text-accent-foreground",
  seminar: "bg-event-seminar text-accent-foreground",
  fest: "bg-event-fest text-primary-foreground",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: events } = useEvents();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {};
    events?.forEach((event) => {
      const d = new Date(event.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate().toString();
        if (!map[key]) map[key] = [];
        map[key]!.push(event);
      }
    });
    return map;
  }, [events, year, month]);

  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Calendar View</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-display font-semibold text-lg min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border rounded-xl overflow-hidden">
          {DAYS.map((d) => (
            <div key={d} className="bg-muted/50 p-2 text-center text-xs font-semibold text-muted-foreground border-b">
              {d}
            </div>
          ))}
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`min-h-[100px] p-1.5 border-b border-r ${day ? "bg-background" : "bg-muted/20"} ${isToday(day!) ? "ring-2 ring-primary ring-inset" : ""}`}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium ${isToday(day) ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {eventsByDate[day.toString()]?.slice(0, 3).map((event) => (
                      <Link key={event.id} to={`/event/${event.id}`}>
                        <Badge className={`${typeColors[event.event_type]} text-[10px] block truncate cursor-pointer hover:opacity-80`}>
                          {event.title}
                        </Badge>
                      </Link>
                    ))}
                    {(eventsByDate[day.toString()]?.length ?? 0) > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{eventsByDate[day.toString()]!.length - 3} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
