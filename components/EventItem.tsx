
import React from 'react';
import { TimelineEvent } from '../types';
import { dateToPosition, dateRangeToWidth } from '../utils/dateUtils';
import { Info } from 'lucide-react';
import { useTimelineStore } from '../store';

interface EventItemProps {
  event: TimelineEvent;
  timelineStart: Date;
  timelineEnd: Date;
  onClick: (event: TimelineEvent) => void;
  onDragStart: (e: React.DragEvent, event: TimelineEvent) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, timelineStart, timelineEnd, onClick, onDragStart }) => {
  const setDragging = useTimelineStore((state) => state.setDragging);
  const isRange = !!event.endDate;
  const left = dateToPosition(event.startDate, timelineStart, timelineEnd);
  
  const handleDragStart = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    
    // Pass event data through standard drag-and-drop mechanism
    e.dataTransfer.setData('eventId', event.id);
    e.dataTransfer.setData('clickOffsetX', offsetX.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Set global dragging state
    setDragging(event.id, offsetX);
    
    // Create a refined custom ghost element for drag feedback
    const dragGhost = document.createElement('div');
    
    // Apply styles to mimic a professional "picked up" token
    dragGhost.style.position = 'fixed';
    dragGhost.style.top = '-1000px';
    dragGhost.style.left = '-1000px';
    dragGhost.style.display = 'flex';
    dragGhost.style.alignItems = 'center';
    dragGhost.style.padding = '8px 16px';
    dragGhost.style.borderRadius = '8px';
    dragGhost.style.color = 'white';
    dragGhost.style.fontSize = '12px';
    dragGhost.style.fontWeight = '700';
    dragGhost.style.backgroundColor = event.color;
    dragGhost.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    dragGhost.style.zIndex = '9999';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    dragGhost.style.minWidth = '140px';
    dragGhost.style.maxWidth = '240px';
    
    // Add text content
    const textNode = document.createElement('span');
    textNode.style.overflow = 'hidden';
    textNode.style.textOverflow = 'ellipsis';
    textNode.style.whiteSpace = 'nowrap';
    textNode.innerText = event.title;
    dragGhost.appendChild(textNode);
    
    document.body.appendChild(dragGhost);
    
    // Set the ghost image
    e.dataTransfer.setDragImage(dragGhost, offsetX, 20);
    
    // Call the optional callback if provided
    onDragStart(e, event);
    
    // Clean up the DOM element after the browser captures the drag image
    setTimeout(() => {
      if (document.body.contains(dragGhost)) {
        document.body.removeChild(dragGhost);
      }
    }, 0);
  };

  const handleDragEnd = () => {
    setDragging(null, null);
  };

  const commonClasses = "absolute h-8 rounded-md flex items-center px-3 text-white text-xs font-semibold shadow-sm transition-all hover:brightness-110 active:scale-95 z-10 overflow-hidden cursor-grab active:cursor-grabbing";

  if (isRange) {
    const width = dateRangeToWidth(event.startDate, event.endDate!, timelineStart, timelineEnd);
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onClick(event)}
        className={commonClasses}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          backgroundColor: event.color,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        title={event.title}
      >
        <span className="truncate pointer-events-none">{event.title}</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(event)}
      className="absolute h-8 w-8 rounded-full flex items-center justify-center text-white shadow-md transition-all hover:scale-110 active:scale-95 z-10 cursor-grab active:cursor-grabbing"
      style={{
        left: `${left}%`,
        backgroundColor: event.color,
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      title={event.title}
    >
      <Info size={14} className="pointer-events-none" />
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-700 font-bold bg-white/80 px-1 rounded pointer-events-none">
        {event.title}
      </div>
    </div>
  );
};

export default EventItem;
