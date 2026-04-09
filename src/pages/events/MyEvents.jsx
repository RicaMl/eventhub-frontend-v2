import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { participantService } from "../../services/api";
import EventCard from "../../components/events/EventCard";
import toast from "react-hot-toast";
import "../../css/Events.css";

export default function MyEvents() {
  const { t, user } = useApp();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    participantService.getEvents(user.id)
      .then((data) => {
        const events = Array.isArray(data) ? data : data.results || [];
        setMyEvents(events);
      })
      .catch((err) => {
        console.error("Erreur chargement de mes événements:", err);
        toast.error(t("general.error"));
        setMyEvents([]);
      })
      .finally(() => setLoading(false));
  }, [user, t]);

  if (!user) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
        <span className="empty-icon">🔒</span>
        <h2>{t("myEvents.loginRequired")}</h2>
        <p>{t("myEvents.loginRequiredDesc")}</p>
      </div>
    );
  }

  return (
    <main className="events-page">
      <div className="container">
        {/* Header */}
        <div className="events-header">
          <div>
            <h1 className="events-title">{t("myEvents.title")}</h1>
            <p className="events-subtitle">{t("myEvents.subtitle")}</p>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="results-count">
            <strong>{myEvents.length}</strong> {t("myEvents.eventsFound")}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid-3">
            {[1,2,3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : myEvents.length > 0 ? (
          <div className="grid-3">
            {myEvents.map((ev, i) => (
              <div key={ev.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "80px 20px" }}>
            <span className="empty-icon">📭</span>
            <h3 style={{ marginBottom: 8 }}>{t("myEvents.noEvents")}</h3>
            <p style={{ color: "var(--text-muted)" }}>{t("myEvents.noEventsDesc")}</p>
          </div>
        )}
      </div>
    </main>
  );
}