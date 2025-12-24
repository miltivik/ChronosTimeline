
import { create } from 'zustand';
import { TimelineState, TimelineEvent, TimelineLayer } from './types';
import { addMonths, startOfYear, endOfYear } from 'date-fns';

export const useTimelineStore = create<TimelineState>((set) => ({
  events: [
    {
      id: '1',
      title: 'Initial Research',
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 2, 20),
      layerId: 'dev',
      color: '#3b82f6',
      description: 'Competitor analysis and market research'
    },
    {
      id: '2',
      title: 'Design Phase',
      startDate: new Date(2024, 2, 25),
      endDate: new Date(2024, 5, 10),
      layerId: 'design',
      color: '#ec4899',
      description: 'UI/UX mockups and prototyping'
    },
    {
      id: '3',
      title: 'Beta Launch',
      startDate: new Date(2024, 6, 15),
      layerId: 'marketing',
      color: '#10b981',
      description: 'First public beta released'
    },
    {
      id: '4',
      title: 'Frontend Dev',
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2024, 7, 30),
      layerId: 'dev',
      color: '#3b82f6'
    }
  ],
  layers: [
    { id: 'dev', name: 'Development' },
    { id: 'design', name: 'Design' },
    { id: 'marketing', name: 'Marketing' }
  ],
  zoomLevel: 2,
  viewportStart: startOfYear(new Date(2024, 0, 1)),
  viewportEnd: endOfYear(new Date(2024, 0, 1)),
  
  draggedEventId: null,
  dragOffsetX: null,

  addEvent: (eventData) => set((state) => ({
    events: [...state.events, { ...eventData, id: Math.random().toString(36).substr(2, 9) }]
  })),

  updateEvent: (id, updatedFields) => set((state) => ({
    events: state.events.map((e) => e.id === id ? { ...e, ...updatedFields } : e)
  })),

  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),

  addLayer: (name) => set((state) => ({
    layers: [...state.layers, { id: Math.random().toString(36).substr(2, 9), name }]
  })),

  updateLayer: (id, name) => set((state) => ({
    layers: state.layers.map((l) => l.id === id ? { ...l, name } : l)
  })),

  deleteLayer: (id) => set((state) => ({
    layers: state.layers.filter((l) => l.id !== id),
    events: state.events.filter((e) => e.layerId !== id)
  })),

  setZoom: (zoom) => set({ zoomLevel: zoom }),
  
  setDragging: (id, offsetX) => set({ draggedEventId: id, dragOffsetX: offsetX })
}));
