import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventFiltersProps {
  search: string;
  city: string;
  college: string;
  department: string;
  eventType: string;
  onSearchChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onCollegeChange: (v: string) => void;
  onDepartmentChange: (v: string) => void;
  onEventTypeChange: (v: string) => void;
  onClear: () => void;
}

export function EventFilters(props: EventFiltersProps) {
  const hasFilters = props.search || props.city || props.college || props.department || props.eventType;

  return (
    <div className="glass-effect rounded-xl p-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Input
          placeholder="City"
          value={props.city}
          onChange={(e) => props.onCityChange(e.target.value)}
        />
        <Input
          placeholder="College"
          value={props.college}
          onChange={(e) => props.onCollegeChange(e.target.value)}
        />
        <Input
          placeholder="Department"
          value={props.department}
          onChange={(e) => props.onDepartmentChange(e.target.value)}
        />
        <Select value={props.eventType} onValueChange={props.onEventTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hackathon">Hackathon</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="seminar">Seminar</SelectItem>
            <SelectItem value="fest">Fest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={props.onClear} className="text-muted-foreground">
          <X className="h-3 w-3 mr-1" /> Clear filters
        </Button>
      )}
    </div>
  );
}
