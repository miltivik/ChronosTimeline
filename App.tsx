
import React, { useState, useMemo, useCallback } from 'react';
import { useTimelineStore } from './store';
import Sidebar from './components/Sidebar';
import TimelineHeader from './components/TimelineHeader';
import LayerRow from './components/LayerRow';
import EventDialog from './components/EventDialog';
import { TimelineEvent } from './types';
import { Plus, Search, ZoomIn, ZoomOut, Share2, Settings, Menu, X } from 'lucide-react';
import { positionToDate } from './utils/dateUtils';
import { differenceInDays, addDays } from 'date-fns';

const App: React.FC = () => {
  // Use individual selectors to prevent App from re-rendering on internal store changes (like dragging state)
  const events = useTimelineStore((state) => state.events);
  const layers = useTimelineStore((state) => state.layers);
  const zoomLevel = useTimelineStore((state) => state.zoomLevel);
  const viewportStart = useTimelineStore((state) => state.viewportStart);
  const viewportEnd = useTimelineStore((state) => state.viewportEnd);
  
  const addEvent = useTimelineStore((state) => state.addEvent);
  const updateEvent = useTimelineStore((state) => state.updateEvent);
  const deleteEvent = useTimelineStore((state) => state.deleteEvent);
  const addLayer = useTimelineStore((state) => state.addLayer);
  const updateLayer = useTimelineStore((state) => state.updateLayer);
  const deleteLayer = useTimelineStore((state) => state.deleteLayer);
  const setZoom = useTimelineStore((state) => state.setZoom);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const containerWidth = useMemo(() => `${zoomLevel * 100}%`, [zoomLevel]);

  const handleEventClick = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const handleSaveEvent = (eventData: any) => {
    if (eventData.id) {
      const { id, ...fields } = eventData;
      updateEvent(id, fields);
    } else {
      addEvent(eventData);
    }
    setIsDialogOpen(false);
  };

  const handleEventDrop = useCallback((eventId: string, layerId: string, dropX: number, clickOffsetX: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const container = document.getElementById('timeline-canvas-container');
    if (!container) return;
    
    const totalPixelWidth = container.scrollWidth;
    const startPixel = dropX - clickOffsetX;
    const startPercent = (startPixel / totalPixelWidth) * 100;
    
    const newStartDate = positionToDate(startPercent, viewportStart, viewportEnd);
    
    const updates: Partial<TimelineEvent> = {
      startDate: newStartDate,
      layerId: layerId
    };

    if (event.endDate) {
      const duration = differenceInDays(event.endDate, event.startDate);
      updates.endDate = addDays(newStartDate, duration);
    }

    updateEvent(eventId, updates);
  }, [events, viewportStart, viewportEnd, updateEvent]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        layers={layers}
        onAddLayer={addLayer}
        onUpdateLayer={updateLayer}
        onDeleteLayer={deleteLayer}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Timeline View */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toolbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-40">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-blue-600">Chronos</h1>
            
            <div className="flex items-center gap-1 md:gap-2 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setZoom(Math.max(1, zoomLevel - 0.5))}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"
              >
                <ZoomOut size={16} md:size={18} />
              </button>
              <div className="px-1 md:px-2 text-[10px] md:text-xs font-bold text-gray-500 min-w-[2.5rem] md:min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button 
                onClick={() => setZoom(Math.min(5, zoomLevel + 0.5))}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"
              >
                <ZoomIn size={16} md:size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 xl:w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors hidden sm:block">
                <Share2 size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors hidden sm:block">
                <Settings size={20} />
              </button>
              <button 
                onClick={handleAddClick}
                className="ml-1 md:ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-md transition-all active:scale-95 text-sm"
              >
                <Plus size={18} /> <span className="hidden sm:inline">Create Event</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div id="timeline-canvas-container" className="flex-1 overflow-auto custom-scrollbar relative">
          <div style={{ width: containerWidth }} className="h-full relative min-w-full">
            <TimelineHeader 
              start={viewportStart} 
              end={viewportEnd} 
              zoomLevel={zoomLevel}
              width={containerWidth}
            />

            {/* Render Rows */}
            <div className="relative">
              {layers.map((layer) => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  events={events.filter((e) => e.layerId === layer.id)}
                  timelineStart={viewportStart}
                  timelineEnd={viewportEnd}
                  onEventClick={handleEventClick}
                  onEventDrop={handleEventDrop}
                />
              ))}

              {/* Today Marker */}
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500 z-10 pointer-events-none"
                style={{
                  left: `${(differenceInDaysHelper(new Date(), viewportStart) / Math.max(1, differenceInDaysHelper(viewportEnd, viewportStart))) * 100}%`
                }}
              >
                <div className="bg-red-500 text-white text-[8px] px-1 absolute top-0 -translate-x-1/2 rounded font-bold">TODAY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <button
          onClick={handleAddClick}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform sm:hidden"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Modals */}
      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        layers={layers}
        initialEvent={editingEvent}
      />
    </div>
  );
};

function differenceInDaysHelper(date1: Date, date2: Date) {
  return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}

export default App;
