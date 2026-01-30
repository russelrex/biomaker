'use client';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BiomarkerData } from '@/src/lib/types';

interface BiomarkerGraphProps {
  data: BiomarkerData;
}

interface MockDataPoint {
  value: number;
  date: string;
  status: 'optimal' | 'in-range' | 'out-of-range';
}

export default function BiomarkerGraph({ data }: BiomarkerGraphProps) {
  const { value, ranges, graphMin, graphMax, unit } = data;
  
  const totalHeight = 400;
  const barWidth = 80;
  const gapBetweenBars = 20;
  const numberOfBars = 5;
  const totalWidth = (barWidth * numberOfBars) + (gapBetweenBars * (numberOfBars - 1));
  
  const mockDataPoints: MockDataPoint[] = useMemo(() => {
    const baseValue = value;
    const variations = [-0.15, -0.08, 0, 0.05, 0.12];
    const dates = ['Jan 10, 2025', 'Mar 15, 2025', 'May 20, 2025', 'Jul 25, 2025', 'Aug 15, 2025'];
    
    return variations.map((variation, index) => {
      const mockValue = baseValue + (baseValue * variation);
      let status: 'optimal' | 'in-range' | 'out-of-range' = 'out-of-range';
      
      if (ranges.optimal && mockValue >= ranges.optimal[0] && mockValue <= ranges.optimal[1]) {
        status = 'optimal';
      } else if (ranges.inRange && mockValue >= ranges.inRange[0] && mockValue <= ranges.inRange[1]) {
        status = 'in-range';
      }
      
      return {
        value: Number(mockValue.toFixed(2)),
        date: dates[index],
        status,
      };
    });
  }, [value, ranges]);
  
  const chartData = useMemo(() => {
    const zones: Array<{
      start: number;
      end: number;
      color: string;
      label: string;
      value: string;
      height: number;
      yStart: number;
    }> = [];
    
    const calculateYPosition = (val: number) => {
      return totalHeight - ((val - graphMin) / (graphMax - graphMin)) * totalHeight;
    };
    
    const calculateHeight = (start: number, end: number) => {
      return ((end - start) / (graphMax - graphMin)) * totalHeight;
    };
    
    let currentY = totalHeight;
    
    if (ranges.outOfRange) {
      const [min, max] = ranges.outOfRange;
      if (min < (ranges.inRange?.[0] ?? ranges.optimal?.[0] ?? Infinity)) {
        const endPoint = ranges.inRange?.[0] ?? ranges.optimal?.[0] ?? max;
        const zoneHeight = calculateHeight(graphMin, endPoint);
        const yStart = currentY - zoneHeight;
        zones.push({
          start: graphMin,
          end: endPoint,
          color: '#FEE2E2',
          label: 'Out of range',
          value: `< ${endPoint}`,
          height: zoneHeight,
          yStart: yStart,
        });
        currentY = yStart;
      }
    }
    
    if (ranges.inRange) {
      const [min, max] = ranges.inRange;
      const zoneHeight = calculateHeight(min, max);
      const yStart = currentY - zoneHeight;
      zones.push({
        start: min,
        end: max,
        color: '#FEF3C7',
        label: 'In range',
        value: `${min}-${max}`,
        height: zoneHeight,
        yStart: yStart,
      });
      currentY = yStart;
    }
    
    if (ranges.optimal) {
      const [min, max] = ranges.optimal;
      const zoneHeight = calculateHeight(min, max);
      const yStart = currentY - zoneHeight;
      zones.push({
        start: min,
        end: max,
        color: '#D1FAE5',
        label: 'Optimal',
        value: `${min}-${max}`,
        height: zoneHeight,
        yStart: yStart,
      });
      currentY = yStart;
    }
    
    if (ranges.outOfRange) {
      const [min, max] = ranges.outOfRange;
      const upperBound = ranges.optimal?.[1] ?? ranges.inRange?.[1];
      if (upperBound && max > upperBound) {
        const zoneHeight = calculateHeight(upperBound, graphMax);
        const yStart = currentY - zoneHeight;
        zones.push({
          start: upperBound,
          end: graphMax,
          color: '#FEE2E2',
          label: 'Out of range',
          value: `> ${upperBound}`,
          height: zoneHeight,
          yStart: yStart,
        });
      }
    }
    
    zones.sort((a, b) => a.start - b.start);
    
    return { zones };
  }, [ranges, graphMin, graphMax]);
  
  const { zones } = chartData;
  
  const getStatusColor = (status: string) => {
    return status === 'optimal' ? '#10B981' : 
           status === 'in-range' ? '#F59E0B' : '#EF4444';
  };
  
  const calculateYPosition = (val: number) => {
    return totalHeight - ((val - graphMin) / (graphMax - graphMin)) * totalHeight;
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
        }}
      >
        <svg width={totalWidth} height={totalHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
          {mockDataPoints.map((point, barIndex) => {
            const xOffset = barIndex * (barWidth + gapBetweenBars);
            
            return (
              <g key={barIndex}>
                {zones.map((zone, zoneIndex) => {
                  const yStart = zone.yStart;
                  const height = zone.height;
                  const isFirst = zoneIndex === 0;
                  const isLast = zoneIndex === zones.length - 1;
                  
                  return (
                    <rect
                      key={zoneIndex}
                      x={xOffset}
                      y={yStart}
                      width={barWidth}
                      height={height}
                      fill={zone.color}
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth={1}
                      rx={isFirst || isLast ? 4 : 0}
                    />
                  );
                })}
                
                {point.value && (
                  <>
                    <line
                      x1={xOffset}
                      y1={calculateYPosition(point.value)}
                      x2={xOffset + barWidth}
                      y2={calculateYPosition(point.value)}
                      stroke={getStatusColor(point.status)}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      opacity={0.5}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
        
        {mockDataPoints.map((point, index) => {
          const xOffset = index * (barWidth + gapBetweenBars);
          const yPos = calculateYPosition(point.value);
          const color = getStatusColor(point.status);
          const isLatest = index === mockDataPoints.length - 1;
          
          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: isLatest ? '64px' : '48px',
                height: isLatest ? '64px' : '48px',
                left: `${xOffset + (barWidth / 2) - (isLatest ? 32 : 24)}px`,
                top: `${yPos - (isLatest ? 32 : 24)}px`,
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: isLatest ? '0 10px 15px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.15)',
                zIndex: isLatest ? 10 : 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                backgroundColor: color,
                color: 'white',
                opacity: isLatest ? 1 : 0.9,
              }}
            >
              <Typography sx={{ fontSize: isLatest ? '14px' : '12px', fontWeight: 700 }}>
                {point.value}
              </Typography>
            </Box>
          );
        })}
        
        {mockDataPoints.map((point, index) => {
          const xOffset = index * (barWidth + gapBetweenBars);
          return (
            <Box
              key={`date-${index}`}
              sx={{
                position: 'absolute',
                bottom: '-30px',
                left: `${xOffset}px`,
                width: `${barWidth}px`,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {point.date.split(',')[0]}
              </Typography>
            </Box>
          );
        })}
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {zones.slice().reverse().map((zone, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '4px',
                backgroundColor: zone.color,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#374151',
                  fontSize: '14px',
                }}
              >
                {zone.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontSize: '12px',
                }}
              >
                {zone.value} {unit}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#4B5563',
            fontSize: '14px',
          }}
        >
          Latest result
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#9CA3AF',
            fontSize: '12px',
          }}
        >
          {mockDataPoints[mockDataPoints.length - 1]?.date || 'Aug 15, 2025'}
        </Typography>
      </Box>
    </Box>
  );
}
