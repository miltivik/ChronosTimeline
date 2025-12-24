
import React, { useState } from 'react';
import { TimelineEvent, TimelineLayer } from '../types';
import EventItem from './EventItem';
import { useTimelineStore } from '../store';
import { dateRangeToWidth } from '../utils/dateUtils';
import { Info } from 'lucide-react';

interface LayerRowProps {
  layer: TimelineLayer;
  events: TimelineEvent[];
  timelineStart: Date;
  timelineEnd: Date;
  onEventClick: (event: TimelineEvent) => void;
  onEventDrop: (eventId: string, layerId: string, dropX: number, clickOffsetX: number) => void;
}

const LayerRow: React.FC<LayerRowProps> = ({ layer, events, timelineStart, timelineEnd, onEventClick, onEventDrop }) => {
  const [isOver, setIsOver] = useState(false);
  const [previewX, setPreviewX] = useState<number>(0);
  
  // Use individual selectors for stability
  const draggedEventId = useTimelineStore((state) => state.draggedEventId);
  const dragOffsetX = useTimelineStore((state) => state.dragOffsetX);
  const allEvents = useTimelineStore((state) => state.events);

  const draggedEvent = allEvents.find(e => e.id === draggedEventId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
    
    // Calculate current preview position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPreviewX(x);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const eventId = e.dataTransfer.getData('eventId');
    const clickOffsetXString = e.dataTransfer.getData('clickOffsetX');
    const clickOffsetX = parseFloat(clickOffsetXString || '0');
    
    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    
    onEventDrop(eventId, layer.id, dropX, clickOffsetX);
  };

  const renderPreview = () => {
    if (!isOver || !draggedEvent || dragOffsetX === null) return null;

    const rowElement = document.getElementById(`row-${layer.id}`);
    if (!rowElement) return null;
    
    const rect = rowElement.getBoundingClientRect();
    const startX = previewX - dragOffsetX;
    const leftPercent = (startX / rect.width) * 100;
    const isRange = !!draggedEvent.endDate;

    if (isRange) {
      const widthPercent = dateRangeToWidth(draggedEvent.startDate, draggedEvent.endDate!, timelineStart, timelineEnd);
      return (
        <div
          className="absolute h-8 rounded-md flex items-center px-3 text-white text-xs font-semibold opacity-30 pointer-events-none z-0 overflow-hidden"
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            backgroundColor: draggedEvent.color,
            top: '50%',
            transform: 'translateY(-50%)',
            border: '2px dashed rgba(255,255,255,0.5)'
          }}
        >
          <span className="truncate">{draggedEvent.title}</span>
        </div>
      );
    }

    return (
      <div
        className="absolute h-8 w-8 rounded-full flex items-center justify-center text-white opacity-30 pointer-events-none z-0"
        style={{
          left: `${leftPercent}%`,
          backgroundColor: draggedEvent.color,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: '2px dashed rgba(255,255,255,0.5)'
        }}
      >
        <Info size={14} />
      </div>
    );
  };

  return (
    <div 
      id={`row-${layer.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-b border-gray-100 flex items-center group transition-colors h-24 ${isOver ? 'bg-blue-50/50' : 'bg-white/30 hover:bg-white/50'}`}
    >
      {/* Visual background grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px)] bg-[size:100px_100%]"></div>
      </div>

      <div className="relative h-full w-full">
        {renderPreview()}
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            onClick={onEventClick}
            onDragStart={() => {}} 
          />
        ))}
      </div>
    </div>
  );
};

export default LayerRow;
