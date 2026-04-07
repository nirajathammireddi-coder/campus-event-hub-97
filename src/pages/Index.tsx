import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { EventFilters } from "@/components/EventFilters";
import { useEvents } from "@/hooks/useEvents";
import { Sparkles, Calendar, Users, Zap } from "lucide-react";

const Index = () => {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [eventType, setEventType] = useState("");

  const filters = {
    search: search || undefined,
    city: city || undefined,
    college: college || undefined,
    department: department || undefined,
    eventType: eventType && eventType !== "all" ? eventType : undefined,
  };

  const { data: events, isLoading } = useEvents(filters);

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setCollege("");
    setDepartment("");
    setEventType("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Discover campus events across colleges
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
            Smart Event<br />Discovery
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Find hackathons, workshops, seminars, and fests from colleges near you — all in one place.
          </p>
          <div className="flex justify-center gap-8 pt-4 text-primary-foreground/70 text-sm">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Events</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Multi-College</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Real-time</span>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="container py-10 space-y-6">
        <EventFilters
          search={search}
          city={city}
          college={college}
          department={department}
          eventType={eventType}
          onSearchChange={setSearch}
          onCityChange={setCity}
          onCollegeChange={setCollege}
          onDepartmentChange={setDepartment}
          onEventTypeChange={setEventType}
          onClear={clearFilters}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-display">No events found</p>
            <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event, i) => (
              <div key={event.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
