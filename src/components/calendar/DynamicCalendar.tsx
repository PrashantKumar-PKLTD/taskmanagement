import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, ToolbarProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enGB from "date-fns/locale/en-GB";
import { Menu, X, Plus, Filter, Calendar as CalendarIcon, Clock } from "lucide-react";

// Base react-big-calendar styles
import "react-big-calendar/lib/css/react-big-calendar.css";

/* ========================= Enhanced Dark theme + fully responsive ========================= */
const ENHANCED_RESPONSIVE_CSS = `
:root {
  --brand: #1b2636;
  --bg: #0e1626;
  --panel: #121a2a;
  --panel-2: #0f1726;
  --border: #22314a;
  --muted: #9aa6b2;
  --text: #e6edf3;
  --today: rgba(27,38,54,.35);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
}

.rbc-calendar {
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

/* Enhanced Toolbar */
.rbc-toolbar {
  color: var(--text);
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  gap: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background: var(--panel-2);
}

.rbc-toolbar .rbc-toolbar-label {
  font-weight: 600;
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0;
  min-width: 0;
  flex: 1;
}

.rbc-btn-group {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.rbc-btn-group > button {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border-radius: 0;
  border-right: none;
}

.rbc-btn-group > button:last-child {
  border-right: 1px solid var(--border);
}

.rbc-btn-group > button:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.rbc-btn-group > button:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.rbc-btn-group > button:hover {
  background: var(--panel-2);
  transform: translateY(-1px);
}

.rbc-btn-group > button.rbc-active {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}

/* Grid + headers */
.rbc-header {
  background: var(--panel-2);
  color: var(--text);
  border-color: var(--border);
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.rbc-month-row + .rbc-month-row,
.rbc-day-bg + .rbc-day-bg,
.rbc-time-header,
.rbc-time-content,
.rbc-timeslot-group,
.rbc-row,
.rbc-row-segment {
  border-color: var(--border);
}

.rbc-off-range-bg {
  background: rgba(255,255,255,0.02);
}

.rbc-today {
  background: var(--today);
}

.rbc-current-time-indicator {
  background-color: var(--brand);
  height: 2px;
}

/* Enhanced Events */
.rbc-event {
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  box-shadow: var(--shadow);
  transition: all 0.2s;
}

.rbc-event:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.rbc-event.rbc-selected {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

/* Agenda */
.rbc-agenda-view table.rbc-agenda-table {
  border-color: var(--border);
}

.rbc-agenda-view thead > tr > th {
  background: var(--panel-2);
  color: var(--text);
  font-weight: 600;
}

.rbc-agenda-view tbody > tr > td {
  color: var(--text);
  border-color: var(--border);
}

/* Selection & popups */
.rbc-slot-selection {
  background: rgba(27, 38, 54, 0.3);
  border: 2px solid var(--brand);
}

.rbc-overlay {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
}

.rbc-overlay-header {
  border-bottom: 1px solid var(--border);
  color: var(--text);
  background: var(--panel-2);
  font-weight: 600;
}

/* Time slots */
.rbc-timeslot-group {
  min-height: 40px;
}

.rbc-time-slot {
  border-color: var(--border);
}

/* Month view date cells */
.rbc-date-cell {
  padding: 8px;
  text-align: right;
}

.rbc-date-cell > a {
  color: var(--text);
  font-weight: 500;
}

.rbc-date-cell.rbc-off-range > a {
  color: var(--muted);
}

/* ----------------- Enhanced Responsive breakpoints ----------------- */

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .rbc-calendar {
    font-size: 1rem;
  }
  
  .rbc-event {
    font-size: 0.9rem;
    padding: 6px 10px;
  }
}

/* Desktop (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .rbc-toolbar {
    padding: 0.875rem 1rem;
  }
  
  .rbc-event {
    font-size: 0.825rem;
    padding: 4px 7px;
  }
}

/* Tablet Landscape (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .rbc-toolbar {
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .rbc-toolbar .rbc-toolbar-label {
    font-size: 1rem;
    text-align: center;
  }
  
  .rbc-btn-group > button {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .rbc-event {
    font-size: 0.75rem;
    padding: 3px 6px;
  }
  
  .rbc-time-content {
    overflow-x: auto;
  }
  
  .rbc-header {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
}

/* Mobile Landscape (640px - 767px) */
@media (min-width: 640px) and (max-width: 767px) {
  .rbc-toolbar {
    padding: 0.5rem;
    gap: 0.5rem;
    flex-direction: column;
    align-items: stretch;
  }
  
  .rbc-toolbar .rbc-toolbar-label {
    order: -1;
    text-align: center;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  
  .rbc-btn-group {
    justify-content: center;
  }
  
  .rbc-btn-group > button {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
    flex: 1;
  }
  
  .rbc-event {
    font-size: 0.7rem;
    padding: 2px 5px;
  }
  
  .rbc-month-view .rbc-date-cell {
    font-size: 0.8rem;
    padding: 4px;
  }
}

/* Mobile Portrait (480px - 639px) */
@media (min-width: 480px) and (max-width: 639px) {
  .rbc-toolbar {
    padding: 0.5rem;
    gap: 0.4rem;
    flex-direction: column;
  }
  
  .rbc-toolbar .rbc-toolbar-label {
    order: -1;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  .rbc-btn-group {
    width: 100%;
  }
  
  .rbc-btn-group > button {
    padding: 0.4rem;
    font-size: 0.75rem;
    flex: 1;
  }
  
  .rbc-event {
    font-size: 0.65rem;
    padding: 2px 4px;
  }
  
  .rbc-month-view .rbc-date-cell {
    font-size: 0.75rem;
    padding: 2px;
  }
  
  .rbc-header {
    padding: 0.4rem 0.2rem;
    font-size: 0.75rem;
  }
  
  .rbc-time-header-content {
    overflow-x: auto;
  }
}

/* Small Mobile (< 480px) */
@media (max-width: 479px) {
  .rbc-toolbar {
    padding: 0.4rem;
    gap: 0.3rem;
    flex-direction: column;
  }
  
  .rbc-toolbar .rbc-toolbar-label {
    order: -1;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
    text-align: center;
  }
  
  .rbc-btn-group {
    width: 100%;
  }
  
  .rbc-btn-group > button {
    padding: 0.3rem 0.2rem;
    font-size: 0.7rem;
    flex: 1;
  }
  
  .rbc-event {
    font-size: 0.6rem;
    padding: 1px 3px;
    line-height: 1.2;
  }
  
  .rbc-month-view .rbc-date-cell {
    font-size: 0.7rem;
    padding: 1px;
  }
  
  .rbc-header {
    padding: 0.3rem 0.1rem;
    font-size: 0.7rem;
  }
  
  .rbc-time-content,
  .rbc-time-header-content {
    overflow-x: auto;
  }
  
  .rbc-timeslot-group {
    min-height: 35px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .rbc-event {
    min-height: 32px;
    display: flex;
    align-items: center;
  }
  
  .rbc-btn-group > button {
    min-height: 44px;
    touch-action: manipulation;
  }
  
  .rbc-day-bg {
    min-height: 50px;
  }
}
`;

function useInjectCss(css: string, id = "rbc-enhanced-responsive") {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [css, id]);
}

type MyEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: "planning" | "meeting" | "reports" | "theme" | string;
};

const locales = { "en-GB": enGB } as const;
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const STORAGE_KEY = "rbc-events-v1";

const CATEGORY = {
  planning: { name: "New Event Planning", bg: "#16a34a" },
  meeting:  { name: "Meeting",             bg: "#2563eb" },
  reports:  { name: "Generating Reports",  bg: "#d97706" },
  theme:    { name: "Create New Theme",    bg: "#dc2626" },
} as const;

function seed(): MyEvent[] {
  return [
    { id: "e1", title: "All Day Event",   start: new Date("2025-01-20"), end: new Date("2025-01-20"), allDay: true, category: "planning" },
    { id: "e2", title: "Long Event",      start: new Date("2025-01-22T18:37:00"), end: new Date("2025-01-24T23:59:00"), category: "reports" },
    { id: "e3", title: "Lunch",           start: new Date("2025-01-25T12:00:00"), end: new Date("2025-01-25T13:00:00"), category: "theme" },
    { id: "e4", title: "Team Meeting",    start: new Date("2025-01-25T15:00:00"), end: new Date("2025-01-25T16:00:00"), category: "meeting" },
    { id: "e5", title: "Birthday Party",  start: new Date("2025-01-26T14:37:00"), end: new Date("2025-01-26T16:37:00"), category: "planning" },
  ];
}

const revive = (arr: any[]): MyEvent[] => arr.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
const load = (): MyEvent[] => {
  try { 
    const raw = localStorage.getItem(STORAGE_KEY); 
    return raw ? revive(JSON.parse(raw)) : seed(); 
  } catch { 
    return seed(); 
  }
};
const save = (evts: MyEvent[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evts.map(e => ({ ...e, start: e.start.toISOString(), end: e.end.toISOString() }))));

/* ---------- Enhanced Responsive view hook ---------- */
function viewForWidth(w: number) {
  if (w < 480) return Views.DAY;
  if (w < 768) return Views.DAY;
  if (w < 1024) return Views.WEEK;
  return Views.MONTH;
}

function useResponsiveView() {
  const [view, setView] = useState(viewForWidth(typeof window !== "undefined" ? window.innerWidth : 1200));
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  
  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setView(viewForWidth(width));
      setIsMobile(width < 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  
  return { view, setView, isMobile } as const;
}

/* ----------------------------- Enhanced Responsive Toolbar ----------------------------- */
function ResponsiveToolbar({ label, onNavigate, onView, views, view }: ToolbarProps) {
  const { isMobile } = useResponsiveView();
  
  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate?.("TODAY")}>
          {isMobile ? "Today" : "Today"}
        </button>
        <button type="button" onClick={() => onNavigate?.("PREV")}>
          ‹
        </button>
        <button type="button" onClick={() => onNavigate?.("NEXT")}>
          ›
        </button>
      </div>
      
      <span className="rbc-toolbar-label">{label}</span>
      
      <div className="rbc-btn-group">
        {views?.map((v) => (
          <button 
            key={String(v)} 
            className={v === view ? "rbc-active" : ""} 
            onClick={() => onView?.(v)}
          >
            {isMobile ? String(v).charAt(0).toUpperCase() : String(v).replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DynamicCalendar() {
  useInjectCss(ENHANCED_RESPONSIVE_CSS);

  const [events, setEvents] = useState<MyEvent[]>(load());
  const [filter, setFilter] = useState<"all" | MyEvent["category"]>("all");
  const [creating, setCreating] = useState<{ start: Date; end: Date } | null>(null);
  const [editing, setEditing] = useState<MyEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { view, setView, isMobile } = useResponsiveView();

  useEffect(() => save(events), [events]);

  const visible = useMemo(
    () => (filter === "all" ? events : events.filter(e => e.category === filter)),
    [events, filter]
  );

  const eventStyleGetter = (event: MyEvent) => {
    const COLORS: Record<string, string> = { 
      planning: "#16a34a", 
      meeting: "#2563eb", 
      reports: "#d97706", 
      theme: "#dc2626" 
    };
    const bg = COLORS[event.category || "meeting"] || "var(--brand)";
    return { 
      style: { 
        backgroundColor: bg, 
        borderColor: bg, 
        color: "#fff"
      } 
    };
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-7xl">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon size={20} />
              Calendar
            </h1>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:brightness-110"
              style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        <div className={`grid gap-4 p-3 md:gap-6 md:p-4 transition-all duration-300 ${
          isMobile 
            ? 'grid-cols-1' 
            : 'lg:grid-cols-12'
        }`}>
          
          {/* Enhanced Sidebar */}
          <aside className={`rounded-2xl p-4 transition-all duration-300 ${
            isMobile 
              ? sidebarOpen 
                ? 'block' 
                : 'hidden'
              : 'lg:col-span-3 md:sticky md:top-4'
          }`}
          style={{ 
            background: "var(--panel)", 
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)"
          }}>
            
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setCreating({ start: new Date(), end: new Date(Date.now() + 60 * 60 * 1000) });
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm hover:brightness-110 transition-all duration-200"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  <Plus size={16} />
                  Create New Event
                </button>
                
                <div className="flex items-center gap-2">
                  <Filter size={16} style={{ color: "var(--muted)" }} />
                  <select
                    value={filter as string}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="flex-1 h-10 rounded-lg px-3 text-sm transition-all duration-200 focus:ring-2"
                    style={{ 
                      background: "var(--panel-2)", 
                      color: "var(--text)", 
                      border: "1px solid var(--border)",
                      focusRingColor: "var(--brand)"
                    }}
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORY).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="mb-3 text-sm font-medium flex items-center gap-2" style={{ color: "var(--muted)" }}>
                  <Clock size={14} />
                  Event Categories
                </p>
                <div className="space-y-3">
                  {Object.entries(CATEGORY).map(([key, val]) => {
                    const count = events.filter(e => e.category === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span 
                            className="inline-block h-3 w-3 rounded-full shadow-sm" 
                            style={{ background: val.bg }} 
                          />
                          <span className="text-sm group-hover:opacity-80 transition-opacity">
                            {val.name}
                          </span>
                        </div>
                        <span 
                          className="text-xs px-2 py-1 rounded-full" 
                          style={{ 
                            background: "var(--panel-2)", 
                            color: "var(--muted)",
                            border: "1px solid var(--border)"
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg" style={{ background: "var(--panel-2)" }}>
                    <div className="text-lg font-semibold">{events.length}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>Total Events</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: "var(--panel-2)" }}>
                    <div className="text-lg font-semibold">{visible.length}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>Filtered</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Enhanced Calendar */}
          <main className={`rounded-2xl p-2 md:p-4 transition-all duration-300 ${
            isMobile ? 'col-span-1' : 'lg:col-span-9'
          }`}
          style={{ 
            background: "var(--panel)", 
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)"
          }}>
            <Calendar
              localizer={localizer}
              view={view}
              onView={(v) => setView(v)}
              events={visible}
              defaultDate={new Date()}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              selectable
              onSelectSlot={({ start, end }) => {
                setCreating({ start, end });
                if (isMobile) setSidebarOpen(false);
              }}
              onSelectEvent={(e) => {
                setEditing(e as MyEvent);
                if (isMobile) setSidebarOpen(false);
              }}
              startAccessor="start"
              endAccessor="end"
              style={{ 
                height: isMobile ? 600 : 800, 
                maxWidth: "100%"
              }}
              eventPropGetter={eventStyleGetter}
              popup={!isMobile}
              step={30}
              timeslots={2}
              components={{ toolbar: ResponsiveToolbar }}
              showMultiDayTimes={true}
              doShowMoreDrillDown={true}
            />
          </main>
        </div>
      </div>

      {/* Enhanced Create Modal */}
      {creating && (
        <EventModal
          title="Create New Event"
          initial={{ title: "", start: creating.start, end: creating.end, category: "meeting", allDay: false }}
          onClose={() => setCreating(null)}
          onSave={(data) => {
            setEvents((prev) => [
              ...prev,
              { 
                id: `evt-${Date.now()}`, 
                title: data.title || "Untitled", 
                start: new Date(data.start), 
                end: new Date(data.end), 
                allDay: !!data.allDay, 
                category: data.category 
              },
            ]);
            setCreating(null);
          }}
        />
      )}

      {/* Enhanced Edit Modal */}
      {editing && (
        <EventModal
          title="Edit Event"
          initial={editing}
          onClose={() => setEditing(null)}
          onDelete={() => { 
            setEvents((prev) => prev.filter((e) => e.id !== editing.id)); 
            setEditing(null); 
          }}
          onSave={(data) => {
            setEvents((prev) =>
              prev.map((e) => (e.id === editing.id ? { 
                ...e, 
                ...data, 
                start: new Date(data.start), 
                end: new Date(data.end) 
              } : e))
            );
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EventModal({
  title, initial, onClose, onSave, onDelete,
}: {
  title: string; 
  initial: any; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  onDelete?: () => void;
}) {
  const [form, setForm] = useState({
    id: initial.id,
    title: initial.title || "",
    start: (initial.start ? new Date(initial.start) : new Date()).toISOString().slice(0, 16),
    end: (initial.end ? new Date(initial.end) : new Date(Date.now() + 60 * 60 * 1000)).toISOString().slice(0, 16),
    allDay: !!initial.allDay,
    category: initial.category || "meeting",
  });

  const fieldBase = "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all duration-200";
  const fieldStyle = { 
    background: "var(--panel-2)", 
    color: "var(--text)", 
    border: "1px solid var(--border)",
    focusRingColor: "var(--brand)"
  } as React.CSSProperties;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4 backdrop-blur-sm" 
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-lg rounded-2xl p-4 md:p-6 shadow-2xl animate-in zoom-in-95 duration-200" 
        style={{ 
          background: "var(--panel)", 
          color: "var(--text)",
          border: "1px solid var(--border)",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button 
            onClick={onClose} 
            className="rounded-lg p-2 hover:brightness-110 transition-all duration-200" 
            style={{ color: "var(--muted)", background: "var(--panel-2)" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--muted)" }}>
              Event Title
            </label>
            <input 
              className={fieldBase} 
              style={fieldStyle}
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--muted)" }}>
                Start Date & Time
              </label>
              <input 
                type="datetime-local" 
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                className={fieldBase} 
                style={fieldStyle}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--muted)" }}>
                End Date & Time
              </label>
              <input 
                type="datetime-local" 
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                className={fieldBase} 
                style={fieldStyle}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-3 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.allDay}
                onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                className="h-4 w-4 rounded border-2 transition-all duration-200"
                style={{ accentColor: "var(--brand)" }}
              />
              <span style={{ color: "var(--text)" }}>All day event</span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                Category:
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                style={fieldStyle}
              >
                <option value="planning">New Event Planning</option>
                <option value="meeting">Meeting</option>
                <option value="reports">Generating Reports</option>
                <option value="theme">Create New Theme</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-4 border-t sm:flex-row sm:justify-between" style={{ borderColor: "var(--border)" }}>
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm hover:brightness-110 transition-all duration-200"
                style={{ background: "#dc2626", color: "#fff" }}
              >
                Delete Event
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose} 
                className="rounded-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all duration-200"
                style={{ 
                  background: "transparent", 
                  color: "var(--muted)", 
                  border: "1px solid var(--border)" 
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm hover:brightness-110 transition-all duration-200"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                {title.includes("Edit") ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}