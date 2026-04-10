import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { eventService, registrationService } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, user, lang } = useApp();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);

  const load = () => {
    setLoading(true);
    eventService.getOne(id)
      .then((ev) => {
        console.log("Événement chargé:", ev);
        console.log("Participants:", ev.participants);
        console.log("Utilisateur connecté ID:", user?.id);
        
        setEvent(ev);
        setParticipants(ev.participants || []);
        
        if (user && ev.participants) {
          const registered = ev.participants.some(p => p.id === user.id);
          console.log("Utilisateur trouvé dans participants?", registered);
          setIsRegistered(registered);
        }
        
        if (ev.registration_id) {
          console.log("Registration ID trouvé:", ev.registration_id);
          setIsRegistered(true);
          setRegistrationId(ev.registration_id);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement:", err);
        navigate("/events");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id, user]);

  const handleRegister = async () => {
    if (!user) { 
      navigate("/login"); 
      return; 
    }
    
    setRegistering(true);
    try {
      if (isRegistered) {
        await registrationService.unregisterByEvent(event.id);
        toast.success(t("events.unregistered"));
        setIsRegistered(false);
        setRegistrationId(null);
        load();
      } else {
        const result = await registrationService.register(event.id);
        console.log("Inscription réussie:", result);
        toast.success(t("events.registered"));
        setIsRegistered(true);
        setRegistrationId(result.id);
        load();
      }
    } catch (err) {
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.event_id?.[0] ||
                       "Erreur lors de l'opération";
      toast.error(errorMsg);
    } finally {
      setRegistering(false);
    }
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

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status) => {
    if (status === "ongoing") return t("events.ongoing");
    if (status === "completed") return t("events.completed");
    if (status === "cancelled") return t("events.cancelled");
    return t("events.upcoming");
  };

  const fmt = (d) => d ? new Date(d).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "—";

  if (loading) return (
    <div className="detail-page container">
      <div className="detail-hero skeleton" style={{ height: 360, borderRadius: "var(--radius-lg)", marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 24, width: "50%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: "80%" }} />
    </div>
  );

  if (!event) return null;

  const isFull = event.registered_count >= event.max_participants;
  const pct = event.max_participants
    ? Math.min(100, ((event.registered_count || 0) / event.max_participants) * 100)
    : 0;

  return (
    <main className="detail-page container animate-fade">
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        ← {t("general.back")}
      </button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-hero">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} />
            ) : (
              <div className="detail-hero-placeholder">
                <span>{event.title?.[0]}</span>
              </div>
            )}
            <div className="detail-hero-gradient" />
          </div>

          <div className="detail-title-block">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className={`badge ${getStatusClass(event.status)}`}>
                {getStatusLabel(event.status)}
              </span>
              {(event.price === 0 || event.price === null) && <span className="badge badge-success">{t("events.free")}</span>}
            </div>
            <h1 className="detail-event-title">{event.title}</h1>
          </div>

          <section className="detail-section">
            <h2 className="detail-section-title">{t("events.description")}</h2>
            <p className="detail-description">{event.description || t("events.noDescription")}</p>
          </section>

          <section className="detail-section">
            <h2 className="detail-section-title">
              {t("events.participants")} ({participants.length})
            </h2>
            {participants.length > 0 ? (
              <div className="participants-grid">
                {participants.map((p) => (
                  <div key={p.id} className="participant-chip">
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                      {p.first_name?.charAt(0)?.toUpperCase() + p.last_name?.charAt(0)?.toUpperCase() || p.username?.charAt(0)?.toUpperCase() || p.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span>{p.username || p.email}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("events.noParticipants")}</p>
            )}
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="sidebar-card card">
            <div className="sidebar-spots">
              <div className="spots-label">
                <span>{event.registered_count || 0} / {event.max_participants || "∞"} {t("events.participants")}</span>
                {isFull && <span className="badge badge-warning">{t("events.full")}</span>}
              </div>
              {event.max_participants && (
                <div className="spots-bar" style={{ height: 6, marginTop: 8 }}>
                  <div
                    className="spots-fill"
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: isFull ? "var(--danger)" : "var(--gradient-accent)",
                      borderRadius: 99,
                      transition: "width .6s ease",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-info">
              <div className="info-row">
                <span className="info-icon">📅</span>
                <div>
                  <p className="info-label">{t("events.startDate")}</p>
                  <p className="info-value">{fmt(event.start_date)}</p>
                </div>
              </div>
              {event.end_date && (
                <div className="info-row">
                  <span className="info-icon">🏁</span>
                  <div>
                    <p className="info-label">{t("events.endDate")}</p>
                    <p className="info-value">{fmt(event.end_date)}</p>
                  </div>
                </div>
              )}
              <div className="info-row">
                <span className="info-icon">📍</span>
                <div>
                  <p className="info-label">{t("events.location")}</p>
                  <p className="info-value">{ event.location || t("events.noLocation")}</p>
                </div>
              </div>
              {event.price !== null && (
                <div className="info-row">
                  <span className="info-icon">💶</span>
                  <div>
                    <p className="info-label">{t("events.price")}</p>
                    <p className="info-value">{event.price === 0 ? t("events.free") : `${event.price} €`}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar-divider" />

            {/* CTA - événements non terminés uniquement */}
            {event.status !== "completed" && event.status !== "cancelled" && (
              <button
                className={`btn ${isRegistered ? "btn-secondary" : isFull ? "btn-ghost" : "btn-primary"} sidebar-cta`}
                onClick={handleRegister}
                disabled={registering || (isFull && !isRegistered)}
              >
                {registering ? <><span className="spinner" /> {t("events.loading")}</> :
                 isRegistered ? "✓ " + t("events.unregisterBtn") :
                 !user ? t("events.loginToRegister") :
                 isFull ? t("events.full") :
                 t("events.registerBtn")}
              </button>
            )}

            <button 
              className="btn btn-ghost sidebar-share" 
              onClick={async () => {
                // Vérifiez si la page actuelle est une 404 (si vous avez un moyen de le détecter)
                const eventUrl = window.location.href;
                
                // Test simple : est-ce que la page contient une indication d'erreur ?
                const isErrorPage = document.querySelector('.error-404, [data-status="404"]');
                
                if (isErrorPage) {
                  toast.error("Cette page n'existe pas, impossible de la partager");
                  return;
                }
                
                // Sinon, procédez à la copie
                try {
                  await navigator.clipboard.writeText(eventUrl);
                  toast.success("Lien copié !");
                } catch (err) {
                  toast.error("Impossible de copier");
                }
}}
            >
            🔗 {t("events.shareEvent")}
          </button>
          </div>
        </aside>
      </div>
    </main>
  );
}