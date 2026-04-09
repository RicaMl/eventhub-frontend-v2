import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { truncateText } from "../../utils/string";
import "../../css/EventCard.css";

const STATUS_MAP = {
  upcoming: { label_fr: "À venir", label_en: "Upcoming", class: "badge-accent" },
  ongoing:  { label_fr: "En cours", label_en: "Ongoing",  class: "badge-success" },
  completed: { label_fr: "Terminé", label_en: "Completed", class: "badge-muted" },
  cancelled: { label_fr: "Annulé",   label_en: "Cancelled", class: "badge-danger" },
};

export default function EventCard({ event }) {
  const { t, lang } = useApp();
  const navigate = useNavigate();

  const status = STATUS_MAP[event.status] || STATUS_MAP.upcoming;
  const isFull = event.registered_count >= event.max_participants;
  const spotsLeft = event.max_participants - (event.registered_count || 0);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <article className="event-card animate-fade" onClick={() => navigate(`/events/${event.id}`)}>
      {/* Image */}
      <figure className="ec-image">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="ec-image-placeholder" aria-hidden="true">
            <span>{event.title?.[0] || "E"}</span>
          </div>
        )}
        <figcaption className="sr-only">{event.title}</figcaption>
        <div className="ec-badges">
          <span className={`badge ${status.class}`}>
            {lang === "fr" ? status.label_fr : status.label_en}
          </span>
          {event.price === 0 || event.price === null ? (
            <span className="badge badge-success">{t("events.free")}</span>
          ) : (
            <span className="badge badge-muted">{event.price}€</span>
          )}
        </div>
      </figure>

      {/* Content */}
      <div className="ec-body">
        <h3 className="ec-title">{truncateText(event.title, 40)}</h3>
        <p className="ec-description">{truncateText(event.description, 50)}</p>

        {/* Meta informations */}
        <ul className="ec-meta" aria-label="Informations sur l'événement">
          <li className="ec-meta-item">
            <span className="meta-icon" aria-hidden="true">📅</span>
            <span>{formatDate(event.start_date)}</span>
          </li>
          <li className="ec-meta-item">
            <span className="meta-icon" aria-hidden="true">📍</span>
            <span>{event.location || "—"}</span>
          </li>
          <li className="ec-meta-item">
            <span className="meta-icon" aria-hidden="true">👥</span>
            <span>
              {event.registered_count || 0}/{event.max_participants || "∞"}
              {!isFull && spotsLeft > 0 && (
                <span className="spots-left" aria-label={`${spotsLeft} places restantes`}>
                  ({spotsLeft} {t("events.spotsLeft")})
                </span>
              )}
            </span>
          </li>
        </ul>

        {/* Spots bar */}
        {event.max_participants && (
          <div className="spots-bar" role="progressbar" aria-label="Taux de remplissage" aria-valuenow={Math.min(100, ((event.registered_count || 0) / event.max_participants) * 100)} aria-valuemin="0" aria-valuemax="100">
            <div
              className="spots-fill"
              style={{
                width: `${Math.min(100, ((event.registered_count || 0) / event.max_participants) * 100)}%`,
                background: isFull ? "var(--danger)" : "var(--gradient-accent)",
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="ec-actions">
          <button
            className="btn btn-primary"
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
            aria-label={`Voir les détails de ${event.title}`}
          >
            {t("events.seeDetails")}
          </button>
        </div>
      </div>
    </article>
  );
}