import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { participantService } from "../../services/api";
import { capitalizeEachWord } from "../../utils/string";
import toast from "react-hot-toast";
import "../../css/index.css"

export default function ParticipantEventsModal({ participant, isOpen, onClose }) {
  const { t, lang } = useApp();
  const [participantEvents, setParticipantEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && participant) {
      loadEvents();
    }
  }, [isOpen, participant]);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const response = await participantService.getEvents(participant.id);
      setParticipantEvents(Array.isArray(response) ? response : response.results || []);
    } catch (err) {
      toast.error("Impossible de charger les événements");
      setParticipantEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (participant?.first_name || participant?.last_name) {
      return capitalizeEachWord(`${participant.first_name || ""} ${participant.last_name || ""}`).trim();
    }
    return participant?.username || "Utilisateur";
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric", month: "short", year: "numeric",
  }) : "—";

  // Fonction pour obtenir le libellé du statut en français
  const getStatusLabel = (status) => {
    if (lang === "fr") {
      switch (status) {
        case "upcoming": return "À venir";
        case "ongoing": return "En cours";
        case "completed": return "Terminé";
        case "cancelled": return "Annulé";
        default: return status;
      }
    }
    return status;
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status) => {
    switch (status) {
      case "ongoing": return "badge-success";
      case "completed": return "badge-muted";
      case "cancelled": return "badge-danger";
      default: return "badge-accent";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div 
        className="modal participant-events-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">
            <span aria-hidden="true">📅</span> {t("events.of")} {getDisplayName()}
          </h2>
          <button 
            className="icon-btn" 
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <h3 className="events-list-title" id="events-list-title">
            <span aria-hidden="true">📋</span> {t("events.participatesIn")}
          </h3>
          
          {eventsLoading ? (
            <div className="table-loading" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <span className="sr-only">Chargement des événements...</span>
            </div>
          ) : participantEvents.length > 0 ? (
            <div className="participant-events-list">
              <table className="events-table" aria-labelledby="events-list-title">
                <thead>
                  <tr>
                    <th scope="col">{t("events.table.event")}</th>
                    <th scope="col">{t("events.table.startDate")}</th>
                    <th scope="col">{t("events.table.endDate")}</th>
                    <th scope="col">{t("events.table.location")}</th>
                    <th scope="col">{t("events.table.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {participantEvents.map((event) => (
                    <tr key={event.id}>
                      <th scope="row" className="event-title-cell">
                        <strong>{event.title}</strong>
                        {event.description && (
                          <small className="event-description">{event.description.substring(0, 80)}...</small>
                        )}
                      </th>
                      <td>{fmtDate(event.start_date)}</td>
                      <td>{fmtDate(event.end_date)}</td>
                      <td>{event.location || "—"}</td>
                      <td>
                        <span 
                          className={`badge ${getStatusClass(event.status)}`}
                          aria-label={`Statut: ${getStatusLabel(event.status)}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="participants-empty" role="status" aria-live="polite">
              <p>{t("events.noEventsForParticipant")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}