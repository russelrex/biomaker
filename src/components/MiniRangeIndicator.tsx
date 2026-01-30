'use client';

import React from 'react';
import { Box } from '@mui/material';
import { BiomarkerData } from '@/src/lib/types';

interface MiniRangeIndicatorProps {
  data: BiomarkerData;
}

export default function MiniRangeIndicator({ data }: MiniRangeIndicatorProps) {
  const { value, ranges, graphMin, graphMax } = data;
  
  const position = ((value - graphMin) / (graphMax - graphMin)) * 100;
  
  const zones: Array<{ color: string; width: string; label: string }> = [];
  
  if (ranges.outOfRange) {
    const [min, max] = ranges.outOfRange;
    if (min === 0 || min < (ranges.inRange?.[0] ?? Infinity)) {
      const width = ((ranges.inRange?.[0] ?? ranges.optimal?.[0] ?? min) - graphMin) / 
                    (graphMax - graphMin) * 100;
      zones.push({ color: '#EF4444', width: `${width}%`, label: 'Out of range' });
    }
  }
  
  if (ranges.inRange) {
    const [min, max] = ranges.inRange;
    const start = ((min - graphMin) / (graphMax - graphMin)) * 100;
    const width = ((max - min) / (graphMax - graphMin)) * 100;
    zones.push({ color: '#F59E0B', width: `${width}%`, label: 'In range' });
  }
  
  if (ranges.optimal) {
    const [min, max] = ranges.optimal;
    const width = ((max - min) / (graphMax - graphMin)) * 100;
    zones.push({ color: '#10B981', width: `${width}%`, label: 'Optimal' });
  }
  
  const markerColor = data.status === 'optimal' ? '#10B981' : 
                      data.status === 'in-range' ? '#F59E0B' : '#EF4444';
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '8px',
        display: 'flex',
        borderRadius: '9999px',
        overflow: 'hidden',
      }}
    >
      {zones.map((zone, index) => (
        <Box
          key={index}
          sx={{
            width: zone.width,
            height: '100%',
            backgroundColor: zone.color,
          }}
        />
      ))}
      
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${position}%`,
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          backgroundColor: markerColor,
          zIndex: 1,
        }}
      />
    </Box>
  );
}
