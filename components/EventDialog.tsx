
import React, { useState, useEffect, useMemo } from 'react';
import { TimelineEvent, TimelineLayer } from '../types';
import { X, Calendar, Type, Tag, Trash2, AlertTriangle, AlertCircle, RotateCcw, Save } from 'lucide-react';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<TimelineEvent, 'id'> | TimelineEvent) => void;
  onDelete?: (id: string) => void;
  layers: TimelineLayer[];
  initialEvent?: TimelineEvent | null;
}

const EventDialog: React.FC<EventDialogProps> = ({ isOpen, onClose, onSave, onDelete, layers, initialEvent }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [layerId, setLayerId] = useState(layers[0]?.id || '');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Autosave state
  const [draftFound, setDraftFound] = useState(false);

  const storageKey = useMemo(() => {
    return initialEvent ? `chronos_draft_${initialEvent.id}` : 'chronos_draft_new';
  }, [initialEvent]);

  // Reset form when dialog opens or initialEvent changes
  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title);
        setStartDate(format(initialEvent.startDate, 'yyyy-MM-dd'));
        setEndDate(initialEvent.endDate ? format(initialEvent.endDate, 'yyyy-MM-dd') : '');
        setLayerId(initialEvent.layerId);
        setColor(initialEvent.color);
        setDescription(initialEvent.description || '');
      } else {
        setTitle('');
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
        setEndDate('');
        setLayerId(layers[0]?.id || '');
        setColor('#3b82f6');
        setDescription('');
      }
      setIsConfirmingDelete(false);
      setError(null);
      
      // Check for saved draft
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        setDraftFound(true);
      } else {
        setDraftFound(false);
      }
    }
  }, [initialEvent, layers, isOpen, storageKey]);

  // Autosave Effect
  useEffect(() => {
    if (!isOpen || draftFound) return;

    const timer = setTimeout(() => {
      // Determine current state values
      const currentValues = {
        title,
        startDate,
        endDate,
        layerId,
        color,
        description
      };

      // Determine initial values to check if dirty
      const initialValues = initialEvent ? {
        title: initialEvent.title,
        startDate: format(initialEvent.startDate, 'yyyy-MM-dd'),
        endDate: initialEvent.endDate ? format(initialEvent.endDate, 'yyyy-MM-dd') : '',
        layerId: initialEvent.layerId,
        color: initialEvent.color,
        description: initialEvent.description || ''
      } : {
        title: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        layerId: layers[0]?.id || '',
        color: '#3b82f6',
        description: ''
      };
      
      const isDirty = JSON.stringify(currentValues) !== JSON.stringify(initialValues);

      if (isDirty) {
        localStorage.setItem(storageKey, JSON.stringify(currentValues));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, startDate, endDate, layerId, color, description, isOpen, draftFound, storageKey, initialEvent, layers]);

  useEffect(() => {
    if (error) setError(null);
  }, [startDate, endDate]);

  if (!isOpen) return null;

  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || '');
        setStartDate(parsed.startDate || format(new Date(), 'yyyy-MM-dd'));
        setEndDate(parsed.endDate || '');
        setLayerId(parsed.layerId || layers[0]?.id || '');
        setColor(parsed.color || '#3b82f6');
        setDescription(parsed.description || '');
        setDraftFound(false);
      }
    } catch (e) {
      console.error("Failed to restore draft", e);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(storageKey);
    setDraftFound(false);
  };

  const handleClose = () => {
    localStorage.removeItem(storageKey);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = parseISO(startDate);
    const today = startOfDay(new Date());

    // Validation: Start date cannot be in the past
    // NOTE: This logic was requested in a previous step. 
    // It prevents creating events in the past, but might affect editing old events.
    if (isBefore(start, today)) {
      setError("The start date cannot be earlier than today.");
      return;
    }

    // Validation: End date cannot be before start date
    if (endDate) {
      const end = parseISO(endDate);
      if (isBefore(end, start)) {
        setError("The end date cannot be earlier than the start date.");
        return;
      }
    }

    const eventData: any = {
      title,
      startDate: start,
      layerId,
      color,
      description,
    };
    if (endDate) eventData.endDate = parseISO(endDate);
    if (initialEvent) eventData.id = initialEvent.id;

    onSave(eventData);
    localStorage.removeItem(storageKey);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (initialEvent && onDelete) {
      onDelete(initialEvent.id);
      localStorage.removeItem(storageKey);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white md:rounded-2xl shadow-2xl w-full max-w-lg h-full md:h-auto overflow-y-auto flex flex-col transform animate-in slide-in-from-bottom-6 duration-300 relative">
        
        {/* Confirmation Overlay */}
        {isConfirmingDelete && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Event?</h3>
            <p className="text-gray-500 mb-8 max-w-xs">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{title}"</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleConfirmDelete}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                Yes, delete event
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                No, keep it
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-20">
          <h2 className="text-xl font-bold text-gray-900">
            {initialEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Autosave Restore Banner */}
        {draftFound && (
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex flex-col sm:flex-row gap-2 sm:items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
              <Save size={16} />
              <span>Unsaved changes found</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button 
                onClick={handleRestoreDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw size={14} /> Restore
              </button>
              <button 
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Type size={14} /> Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-base"
              placeholder="e.g. Project Kickoff"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase flex items-center gap-2 ${error && error.includes('start') ? "text-red-500" : "text-gray-500"}`}>
                <Calendar size={14} /> Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:outline-none transition-all text-base ${error && error.includes('start') ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase flex items-center gap-2 ${error && error.includes('end') ? "text-red-500" : "text-gray-500"}`}>
                <Calendar size={14} /> End Date (Optional)
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:outline-none transition-all text-base ${error && error.includes('end') ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Tag size={14} /> Layer
            </label>
            <select
              value={layerId}
              onChange={(e) => setLayerId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-base appearance-none bg-white"
            >
              {layers.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Color Theme</label>
            <div className="flex flex-wrap gap-3">
              {['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${color === c ? 'border-blue-100 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-6 border-t mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-white pb-6 md:pb-0">
            {initialEvent && onDelete && (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} /> Delete Event
              </button>
            )}
            <div className="flex w-full sm:w-auto gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 sm:flex-none px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventDialog;
