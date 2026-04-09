import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { eventService } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/EventForm.css";

const EMPTY = {
  title: "", description: "", start_date: "", end_date: "",
  location: "", max_participants: 10,
  status: "upcoming", price: 0,
};

// Function to format date for datetime-local input
const formatToDatetimeLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EventForm({ event, onClose, onSaved }) {
  const { t } = useApp();
  const isEdit = !!event;
  
  const getInitialForm = () => {
    if (isEdit && event) {
      return {
        ...event,
        start_date: formatToDatetimeLocal(event.start_date),
        end_date: formatToDatetimeLocal(event.end_date),
      };
    }
    return EMPTY;
  };
  
  const [form, setForm] = useState(getInitialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && event) {
      setForm({
        ...event,
        start_date: formatToDatetimeLocal(event.start_date),
        end_date: formatToDatetimeLocal(event.end_date),
      });
    }
  }, [event, isEdit]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const newErrors = {};

    // Required text fields
    if (!form.title?.trim()) newErrors.title = t("validation.required");
    if (!form.description?.trim()) newErrors.description = t("validation.required");
    if (!form.location?.trim()) newErrors.location = t("validation.required");
    
    // Required dates
    if (!form.start_date) newErrors.start_date = t("validation.required");
    if (!form.end_date) newErrors.end_date = t("validation.required");
    
    // Max capacity must be >= 1
    const maxParticipants = Number(form.max_participants);
    if (!form.max_participants || maxParticipants < 1) {
      newErrors.max_participants = t("validation.minOne");
    }
    
    // Price must be >= 0
    const price = Number(form.price);
    if (form.price === undefined || form.price === null || isNaN(price)) {
      newErrors.price = t("validation.required");
    } else if (price < 0) {
      newErrors.price = t("validation.minZero");
    }
    
    if (!form.status) newErrors.status = t("validation.required");

    // end_date >= start_date
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end < start) {
        newErrors.end_date = t("validation.endDateAfterStart");
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        max_participants: Number(form.max_participants),
        price: Number(form.price),
      };

      if (isEdit) {
        await eventService.update(event.id, payload);
        toast.success(t("dashboard.eventUpdated"));
      } else {
        await eventService.create(payload);
        toast.success(t("dashboard.eventCreated"));
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || t("general.error"));
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }) => errors[name] && <span className="field-error" role="alert">{errors[name]}</span>;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal event-form-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{isEdit ? `✏️ ${t("dashboard.editEvent")}` : `✨ ${t("dashboard.createEvent")}`}</h2>
          <button 
            className="icon-btn" 
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form" noValidate>
          {/* General Information */}
          <fieldset className="form-section">
            <legend className="form-section-title">{t("dashboard.generalInfo")}</legend>
            
            <div className="form-group">
              <label className="form-label" htmlFor="event-title">{t("dashboard.eventName")} *</label>
              <input
                id="event-title"
                type="text"
                className={`form-input ${errors.title ? "error" : ""}`}
                value={form.title || ""}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={t("dashboard.eventNamePlaceholder")}
                aria-describedby={errors.title ? "title-error" : undefined}
                aria-invalid={!!errors.title}
              />
              <ErrorMsg name="title" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-description">{t("dashboard.eventDescription")} *</label>
              <textarea
                id="event-description"
                className={`form-input ${errors.description ? "error" : ""}`}
                value={form.description || ""}
                onChange={(e) => setField("description", e.target.value)}
                placeholder={t("dashboard.eventDescriptionPlaceholder")}
                rows={3}
                aria-describedby={errors.description ? "description-error" : undefined}
                aria-invalid={!!errors.description}
              />
              <ErrorMsg name="description" />
            </div>
          </fieldset>

          {/* Dates */}
          <fieldset className="form-section">
            <legend className="form-section-title">{t("dashboard.dates")}</legend>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="event-start-date">{t("dashboard.eventDate")} *</label>
                <input
                  id="event-start-date"
                  type="datetime-local"
                  className={`form-input ${errors.start_date ? "error" : ""}`}
                  value={form.start_date || ""}
                  onChange={(e) => setField("start_date", e.target.value)}
                  aria-describedby={errors.start_date ? "start_date-error" : undefined}
                  aria-invalid={!!errors.start_date}
                />
                <ErrorMsg name="start_date" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="event-end-date">{t("dashboard.eventEndDate")} *</label>
                <input
                  id="event-end-date"
                  type="datetime-local"
                  className={`form-input ${errors.end_date ? "error" : ""}`}
                  value={form.end_date || ""}
                  onChange={(e) => setField("end_date", e.target.value)}
                  aria-describedby={errors.end_date ? "end_date-error" : undefined}
                  aria-invalid={!!errors.end_date}
                />
                <ErrorMsg name="end_date" />
              </div>
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="form-section">
            <legend className="form-section-title">{t("dashboard.location")}</legend>
            <div className="form-group">
              <label className="form-label" htmlFor="event-location">{t("dashboard.eventAddress")} *</label>
              <input
                id="event-location"
                type="text"
                className={`form-input ${errors.location ? "error" : ""}`}
                value={form.location || ""}
                onChange={(e) => setField("location", e.target.value)}
                placeholder={t("dashboard.eventAddressPlaceholder")}
                aria-describedby={errors.location ? "location-error" : undefined}
                aria-invalid={!!errors.location}
              />
              <ErrorMsg name="location" />
            </div>
          </fieldset>

          {/* Details */}
          <fieldset className="form-section">
            <legend className="form-section-title">{t("dashboard.details")}</legend>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="event-capacity">{t("dashboard.eventCapacity")} *</label>
                <input
                  id="event-capacity"
                  type="number"
                  min="1"
                  className={`form-input ${errors.max_participants ? "error" : ""}`}
                  value={form.max_participants || ""}
                  onChange={(e) => setField("max_participants", e.target.value)}
                  placeholder="100"
                  aria-describedby={errors.max_participants ? "max_participants-error" : undefined}
                  aria-invalid={!!errors.max_participants}
                />
                <ErrorMsg name="max_participants" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="event-price">{t("dashboard.eventPrice")} *</label>
                <input
                  id="event-price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.price ? "error" : ""}`}
                  value={form.price ?? 0}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="0"
                  aria-describedby={errors.price ? "price-error" : undefined}
                  aria-invalid={!!errors.price}
                />
                <ErrorMsg name="price" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="event-status">{t("dashboard.eventStatus")} *</label>
              <select
                id="event-status"
                className={`form-input ${errors.status ? "error" : ""}`}
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                aria-describedby={errors.status ? "status-error" : undefined}
                aria-invalid={!!errors.status}
              >
                <option value="upcoming">{t("eventStatus.upcoming")}</option>
                <option value="ongoing">{t("eventStatus.ongoing")}</option>
                <option value="completed">{t("eventStatus.completed")}</option>
                <option value="cancelled">{t("eventStatus.cancelled")}</option>
              </select>
              <ErrorMsg name="status" />
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t("general.cancel")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} aria-label={loading ? "Enregistrement en cours" : "Enregistrer"}>
              {loading ? <><span className="spinner" aria-hidden="true" /> {t("dashboard.saving")}</> : t("dashboard.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}