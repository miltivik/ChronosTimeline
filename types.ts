
export interface TimelineEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  layerId: string;
  color: string;
  description?: string;
}

export interface TimelineLayer {
  id: string;
  name: string;
  color?: string;
}

export interface TimelineState {
  events: TimelineEvent[];
  layers: TimelineLayer[];
  zoomLevel: number; // 1 to 5
  viewportStart: Date;
  viewportEnd: Date;
  
  // Dragging state
  draggedEventId: string | null;
  dragOffsetX: number | null;
  
  // Actions
  addEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<TimelineEvent>) => void;
  deleteEvent: (id: string) => void;
  addLayer: (name: string) => void;
  updateLayer: (id: string, name: string) => void;
  deleteLayer: (id: string) => void;
  setZoom: (zoom: number) => void;
  setDragging: (id: string | null, offsetX: number | null) => void;
}
