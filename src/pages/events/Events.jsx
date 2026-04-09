import { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { eventService } from "../../services/api";
import EventCard from "../../components/events/EventCard";
import "../../css/Events.css";

const STATUSES = ["all", "upcoming", "ongoing", "completed"];

export default function Events() {
  const { t, lang } = useApp();
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  // Charger TOUS les événements une seule fois
  useEffect(() => {
    setLoading(true);
    eventService.getAll({})
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        console.log("=== TOUS LES ÉVÉNEMENTS CHARGÉS ===");
        console.log("Nombre total:", list.length);
        console.log("Liste des prix:", list.map(ev => ({ id: ev.id, title: ev.title, price: ev.price, type: typeof ev.price })));
        console.log("Événements gratuits (price === 0):", list.filter(ev => ev.price === 0).length);
        console.log("Événements gratuits (price === null):", list.filter(ev => ev.price === null).length);
        console.log("Événements gratuits (price === undefined):", list.filter(ev => ev.price === undefined).length);
        setAllEvents(list);
      })
      .catch(() => setAllEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtrage local
  const filteredEvents = useMemo(() => {
    let result = [...allEvents];

    // Filtre par statut
    if (status !== "all") {
      result = result.filter(ev => ev.status === status);
    }

    // Filtre par recherche (titre, description, lieu)
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(ev => 
        ev.title?.toLowerCase().includes(searchLower) ||
        ev.description?.toLowerCase().includes(searchLower) ||
        ev.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par date de début
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(ev => {
        if (!ev.start_date) return false;
        const evDate = new Date(ev.start_date);
        return evDate >= fromDate;
      });
    }

    // Filtre par date de fin
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(ev => {
        if (!ev.start_date) return false;
        const evDate = new Date(ev.start_date);
        return evDate <= toDate;
      });
    }

    // Filtre gratuit uniquement
    if (freeOnly) {
      result = result.filter(ev => ev.price === 0 || ev.price === null);
    }

    return result;
  }, [allEvents, status, search, dateFrom, dateTo, freeOnly]);

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    setFreeOnly(false);
  };

  const hasActiveFilter = search || status !== "all" || dateFrom || dateTo || freeOnly;

  return (
    <main className="events-page">
      <div className="container">
        {/* Header */}
        <div className="events-header">
          <div>
            <h1 className="events-title">{t("events.title")}</h1>
            <p className="events-subtitle">{t("events.subtitle")}</p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="filters-bar">
          {/* Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input search-input"
              placeholder={t("events.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* Status tabs */}
          <div className="status-tabs">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`status-tab ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {t(`events.${s}`)}
              </button>
            ))}
          </div>

          {/* Free filter button */}
          <button
            className={`free-filter-btn ${freeOnly ? "active" : ""}`}
            onClick={() => setFreeOnly(!freeOnly)}
          >
            🎟️ {t("events.free")}
          </button>

          {/* Date range */}
          <div className="date-range">
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title={t("events.filterByDate")}
              placeholder={t("events.fromDate")}
            />
            <span className="date-sep">→</span>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder={t("events.toDate")}
            />
          </div>

          {/* Reset */}
          {hasActiveFilter && (
            <button className="btn btn-ghost" onClick={resetFilters} style={{ fontSize: 13 }}>
              ✕ {t("events.reset")}
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="results-count">
            <strong>{filteredEvents.length}</strong> {t("events.eventsFound")}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid-3">
            {filteredEvents.map((ev, i) => (
              <div key={ev.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "80px 20px" }}>
            <span className="empty-icon">📭</span>
            <h3 style={{ marginBottom: 8 }}>{t("events.noEvents")}</h3>
            {hasActiveFilter && (
              <button className="btn btn-ghost" onClick={resetFilters} style={{ marginTop: 12 }}>
                {t("events.resetFilters")}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}