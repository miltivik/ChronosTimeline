
import React from 'react';
import { getTimelineTicks } from '../utils/dateUtils';

interface TimelineHeaderProps {
  start: Date;
  end: Date;
  zoomLevel: number;
  width: string;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ start, end, zoomLevel, width }) => {
  const ticks = getTimelineTicks(start, end, zoomLevel);

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200" style={{ width }}>
      <div className="relative h-12 w-full">
        {ticks.map((tick, idx) => (
          <div
            key={idx}
            className="absolute top-0 bottom-0 border-l border-gray-200"
            style={{ left: `${tick.position}%` }}
          >
            <span className="ml-2 text-[10px] font-medium text-gray-400 whitespace-nowrap mt-2 block">
              {tick.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineHeader;
