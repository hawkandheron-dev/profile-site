/**
 * Inline edit form for People, Events (Points), and Eras (Periods).
 * Rendered inside TimelineModal when an admin clicks "Edit".
 * Fetches the raw DB row on mount, shows editable fields,
 * and saves changes back to Supabase.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchRawEntity,
  updatePerson,
  updateEvent,
  updateEra,
} from '../../services/entityEditService.js';
import './EditEntityForm.css';

// ── Field definitions per entity type ─────────────────────────────────────

const PERSON_FIELDS = [
  { key: 'person_id', label: 'ID', type: 'text', readOnly: true },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'birth_date', label: 'Birth Date (ISO)', type: 'text', placeholder: '0325-01-01' },
  { key: 'death_date', label: 'Death Date (ISO)', type: 'text', placeholder: '0373-01-01' },
  { key: 'birth_year', label: 'Birth Year', type: 'number' },
  { key: 'death_year', label: 'Death Year', type: 'number' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'role_type', label: 'Role Type', type: 'text', placeholder: 'person or emperor' },
  { key: 'era_id', label: 'Era ID', type: 'text', placeholder: 'era-apostolic' },
  { key: 'is_emperor', label: 'Is Emperor', type: 'checkbox' },
  { key: 'monarch_type', label: 'Monarch Type', type: 'text', placeholder: 'roman-unified, frankish, etc.' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

const EVENT_FIELDS = [
  { key: 'event_id', label: 'ID', type: 'text', readOnly: true },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'event_type', label: 'Event Type', type: 'select', options: ['council', 'document', 'event', 'era'] },
  { key: 'event_date', label: 'Event Date (ISO)', type: 'text', placeholder: '0325-01-01' },
  { key: 'end_date', label: 'End Date (ISO)', type: 'text', placeholder: '0325-12-31' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

const ERA_FIELDS = [
  { key: 'era_id', label: 'ID', type: 'text', readOnly: true },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'start_year', label: 'Start Year', type: 'number' },
  { key: 'end_year', label: 'End Year', type: 'number' },
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

function getFieldDefs(itemType) {
  if (itemType === 'person') return PERSON_FIELDS;
  if (itemType === 'point') return EVENT_FIELDS;
  if (itemType === 'period') return ERA_FIELDS;
  return [];
}

function getTableConfig(itemType) {
  if (itemType === 'person') return { table: 'CH_People', pk: 'person_id' };
  if (itemType === 'point') return { table: 'CH_Events', pk: 'event_id' };
  if (itemType === 'period') return { table: 'CH_Eras', pk: 'era_id' };
  return null;
}

function getUpdateFn(itemType) {
  if (itemType === 'person') return updatePerson;
  if (itemType === 'point') return updateEvent;
  if (itemType === 'period') return updateEra;
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────

export function EditEntityForm({ item, itemType, getToken, onSaved, onCancel }) {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveResult, setSaveResult] = useState(null);

  const fieldDefs = getFieldDefs(itemType);
  const tableConfig = getTableConfig(itemType);

  // Fetch the raw DB row on mount
  useEffect(() => {
    if (!item || !tableConfig) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRawEntity(tableConfig.table, tableConfig.pk, item.id, getToken)
      .then(row => {
        if (cancelled) return;
        setFormData({ ...row });
        setOriginalData({ ...row });
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Failed to load entity');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [item?.id, itemType]);

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setSaveResult(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData || !originalData || !tableConfig) return;

    // Build a diff of changed fields (exclude PK and created_at)
    const changes = {};
    for (const field of fieldDefs) {
      if (field.readOnly) continue;
      const key = field.key;
      const newVal = formData[key];
      const oldVal = originalData[key];

      // Normalize: treat empty string as null for nullable fields
      const normalizedNew = (newVal === '' || newVal === undefined) ? null : newVal;
      const normalizedOld = (oldVal === '' || oldVal === undefined) ? null : oldVal;

      if (normalizedNew !== normalizedOld) {
        changes[key] = normalizedNew;
      }
    }

    if (Object.keys(changes).length === 0) {
      setSaveResult({ type: 'info', message: 'No changes to save.' });
      return;
    }

    setSaving(true);
    setError(null);
    setSaveResult(null);

    try {
      const updateFn = getUpdateFn(itemType);
      const pkValue = formData[tableConfig.pk];
      const updated = await updateFn(pkValue, changes, getToken);

      setOriginalData({ ...updated });
      setFormData({ ...updated });
      setSaveResult({ type: 'success', message: 'Saved successfully.' });
      onSaved?.(updated, itemType);
    } catch (err) {
      setError(err.message || 'Save failed');
      setSaveResult({ type: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  }, [formData, originalData, tableConfig, fieldDefs, itemType, getToken, onSaved]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  if (loading) {
    return <div className="edit-form-loading">Loading entity data...</div>;
  }

  if (error && !formData) {
    return (
      <div className="edit-form-error">
        <p>{error}</p>
        <button type="button" className="edit-form-btn edit-form-btn-secondary" onClick={onCancel}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="edit-entity-form" onKeyDown={handleKeyDown}>
      <div className="edit-form-header">
        <h3>
          Edit {itemType === 'person' ? 'Person' : itemType === 'point' ? 'Event' : 'Era'}
        </h3>
        <span className="edit-form-hint">Ctrl+Enter to save</span>
      </div>

      <div className="edit-form-fields">
        {fieldDefs.map(field => (
          <EditField
            key={field.key}
            field={field}
            value={formData?.[field.key]}
            onChange={handleChange}
          />
        ))}
      </div>

      {saveResult && (
        <div className={`edit-form-result edit-form-result-${saveResult.type}`}>
          {saveResult.message}
        </div>
      )}

      <div className="edit-form-actions">
        <button
          type="button"
          className="edit-form-btn edit-form-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="edit-form-btn edit-form-btn-secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Individual field renderer ─────────────────────────────────────────────

function EditField({ field, value, onChange }) {
  const { key, label, type, readOnly, placeholder, options } = field;
  const displayValue = value ?? '';

  if (type === 'checkbox') {
    return (
      <label className="edit-field edit-field-checkbox">
        <input
          type="checkbox"
          checked={!!value}
          disabled={readOnly}
          onChange={e => onChange(key, e.target.checked)}
        />
        <span className="edit-field-label">{label}</span>
      </label>
    );
  }

  if (type === 'textarea') {
    return (
      <label className="edit-field edit-field-textarea">
        <span className="edit-field-label">{label}</span>
        <textarea
          value={displayValue}
          readOnly={readOnly}
          placeholder={placeholder}
          rows={4}
          onChange={e => onChange(key, e.target.value)}
        />
      </label>
    );
  }

  if (type === 'select') {
    return (
      <label className="edit-field">
        <span className="edit-field-label">{label}</span>
        <select
          value={displayValue}
          disabled={readOnly}
          onChange={e => onChange(key, e.target.value)}
        >
          <option value="">--</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
    );
  }

  if (type === 'color') {
    return (
      <label className="edit-field edit-field-color">
        <span className="edit-field-label">{label}</span>
        <div className="edit-field-color-group">
          <input
            type="color"
            value={displayValue || '#000000'}
            disabled={readOnly}
            onChange={e => onChange(key, e.target.value)}
          />
          <input
            type="text"
            value={displayValue}
            readOnly={readOnly}
            placeholder="#00acc1"
            onChange={e => onChange(key, e.target.value)}
            className="edit-field-color-text"
          />
        </div>
      </label>
    );
  }

  // Default: text or number input
  return (
    <label className="edit-field">
      <span className="edit-field-label">{label}</span>
      <input
        type={type}
        value={displayValue}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={e => {
          const val = type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value;
          onChange(key, val);
        }}
      />
    </label>
  );
}
