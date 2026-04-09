import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { useOutletContext, useNavigate } from "react-router-dom"; 
import { eventService } from "../../services/api";
import EventForm from "../../components/events/EventForm";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useDebounce } from "../../hooks/useApi";
import { truncateText } from "../../utils/string";
import toast from "react-hot-toast";
import "../../css/Dashboard.css";

export default function DashboardEvents() {
  const { t } = useApp();
  const { loadStats } = useOutletContext();
  const navigate = useNavigate();

  const [allEvents, setAllEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(true);
  const [evSearch, setEvSearch] = useState("");
  const debouncedEvSearch = useDebounce(evSearch, 400);

  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  const [showParticipants, setShowParticipants] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);

  const loadEvents = useCallback(() => {
    setEvLoading(true);
    eventService.getAll({})
      .then((d) => {
        const data = Array.isArray(d) ? d : d.results || [];
        setAllEvents(data);
      })
      .catch(() => setAllEvents([]))
      .finally(() => setEvLoading(false));
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Filtrer les événements côté front
  const filteredEvents = useMemo(() => {
    if (!debouncedEvSearch.trim()) {
      return allEvents;
    }
    
    const searchLower = debouncedEvSearch.toLowerCase();
    return allEvents.filter((ev) => {
      return (
        ev.title?.toLowerCase().includes(searchLower) ||
        ev.description?.toLowerCase().includes(searchLower) ||
        ev.location?.toLowerCase().includes(searchLower) ||
        ev.status?.toLowerCase().includes(searchLower)
      );
    });
  }, [allEvents, debouncedEvSearch]);

  

  const openEventParticipants = async (ev) => {
    setShowParticipants(ev);
    try {
      const eventDetails = await eventService.getOne(ev.id);
      setEventParticipants(eventDetails.participants || []);
    } catch (err) {
      toast.error(t("general.error"));
      setEventParticipants([]);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await eventService.delete(deleteEvent.id);
      toast.success(t("dashboard.eventDeleted"));
      loadEvents();
      loadStats(); 
    } catch (err) {
      toast.error(err.response?.data?.detail || t("general.error"));
    }
    setDeleteEvent(null);
  };

  
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="dash-content">
      {/* Search + Create button */}
      <div className="events-header-actions">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Rechercher un événement..."
            value={evSearch}
            onChange={(e) => setEvSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEvent(null); setShowForm(true); }}>
          + {t("dashboard.createEvent")}
        </button>
      </div>

      {/* Table */}
      <div className="events-table-wrap">
        <table className="events-table">
          <thead>
            <tr>
              <th>{t("events.table.event")}</th>
              <th>{t("events.table.description")}</th>
              <th>{t("events.table.startDate")}</th>
              <th>{t("events.table.location")}</th>
              <th>{t("events.table.seats")}</th>
              <th>{t("events.table.status")}</th>
              <th>{t("events.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <span className="ev-name">{ev.title}</span>
                  {ev.price === 0 && <span className="badge badge-success">Gratuit</span>}
                </td>
                 <td className="ev-description">
                  {truncateText(ev.description || "—",  20)}
                </td>
                <td>
                  <span className="ev-date">{fmtDate(ev.start_date)}</span>
                </td>
                <td>
                  {truncateText(ev.location || "—", 60)}
                </td>
                <td>
                  <span className={ev.registered_count >= ev.max_participants ? "text-danger" : ""}>
                    {ev.registered_count || 0}/{ev.max_participants || "∞"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${ev.status === "ongoing" ? "badge-success" : ev.status === "cancelled" ? "badge-danger" : "badge-accent"}`}>
                    {ev.status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn" title="Participants" onClick={() => openEventParticipants(ev)}>👥</button>
                    <button className="action-btn" title="Modifier" onClick={() => { setEditEvent(ev); setShowForm(true); }}>✏️</button>
                    <button className="action-btn danger" title="Supprimer" onClick={() => setDeleteEvent(ev)}>🗑️</button>
                  </div>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
        {evLoading && <div className="table-loading"><span className="spinner" /></div>}
        {!evLoading && filteredEvents.length === 0 && (
          <div className="table-empty">
            {evSearch ? "Aucun résultat pour cette recherche" : t("dashboard.noData")}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <EventForm
          event={editEvent}
          onClose={() => { setShowForm(false); setEditEvent(null); }}
          onSaved={() => { loadEvents(); loadStats(); }}
        />
      )}

      {deleteEvent && (
        <ConfirmModal
          title={`Supprimer "${deleteEvent.title}" ?`}
          message={t("dashboard.deleteWarning")}
          onConfirm={handleDeleteEvent}
          onClose={() => setDeleteEvent(null)}
        />
      )}

      {/* Event participants modal */}
      {showParticipants && (
        <div className="overlay" onClick={() => setShowParticipants(null)}>
          <div className="modal participants-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 {showParticipants.title}</h2>
              <button className="icon-btn" onClick={() => setShowParticipants(null)}>✕</button>
            </div>

            <p className="participants-count">
              Participants inscrits ({eventParticipants.length})
            </p>

            {eventParticipants.length > 0 ? (
              <div className="participants-list">
                {eventParticipants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="participant-item"
                  >
                    <div className="participant-avatar">
                      {participant.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="participant-info">
                      <div className="participant-username">{participant.username}</div>
                      <div className="participant-email">{participant.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="participants-empty">
                Aucun participant inscrit.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}