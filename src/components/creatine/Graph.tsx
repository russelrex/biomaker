'use client';

import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
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

interface CreatineGraphProps {
  data: BiomarkerData;
}

export default function CreatineGraph({ data }: CreatineGraphProps) {
  const { value, ranges, graphMin, graphMax, unit, historicalData } = data;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const totalHeight = 400;
  const barWidth = 80;
  const gapBetweenBars = 20;
  
  const dataPoints = useMemo(() => {
    if (historicalData && historicalData.length > 0) {
      return historicalData.map(point => ({
        value: Number(point.value.toFixed(2)),
        date: point.date,
        status: point.status,
      }));
    }
    
    return [{
      value: Number(value.toFixed(2)),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: data.status,
    }];
  }, [historicalData, value, data.status]);
  
  const numberOfBars = dataPoints.length;
  const totalWidth = (barWidth * numberOfBars) + (gapBetweenBars * Math.max(0, numberOfBars - 1));
  
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
    
    const redLowEnd = 0.7;
    const greenOptimalStart = 0.7;
    const greenOptimalEnd = 1.2;
    const amberInRangeStart = 1.2;
    const amberInRangeEnd = 1.5;
    const redHighStart = 1.5;
    
    if (graphMin < redLowEnd) {
      const zoneHeight = calculateHeight(graphMin, redLowEnd);
      const yStart = currentY - zoneHeight;
      zones.push({
        start: graphMin,
        end: redLowEnd,
        color: '#FEE2E2',
        label: 'Out of range',
        value: `< 0.70`,
        height: zoneHeight,
        yStart: yStart,
      });
      currentY = yStart;
    }
    
    if (greenOptimalEnd > greenOptimalStart) {
      const zoneHeight = calculateHeight(greenOptimalStart, greenOptimalEnd);
      const yStart = currentY - zoneHeight;
      zones.push({
        start: greenOptimalStart,
        end: greenOptimalEnd,
        color: '#D1FAE5',
        label: 'Optimal',
        value: `0.70 - 1.20`,
        height: zoneHeight,
        yStart: yStart,
      });
      currentY = yStart;
    }
    
    if (amberInRangeEnd > amberInRangeStart) {
      const zoneHeight = calculateHeight(amberInRangeStart, amberInRangeEnd);
      const yStart = currentY - zoneHeight;
      zones.push({
        start: amberInRangeStart,
        end: amberInRangeEnd,
        color: '#FEF3C7',
        label: 'In range',
        value: `1.20 - 1.50`,
        height: zoneHeight,
        yStart: yStart,
      });
      currentY = yStart;
    }
    
    if (graphMax > redHighStart) {
      const zoneHeight = calculateHeight(redHighStart, graphMax);
      const yStart = currentY - zoneHeight;
      zones.push({
        start: redHighStart,
        end: graphMax,
        color: '#FEE2E2',
        label: 'Out of range',
        value: `≥ 1.50`,
        height: zoneHeight,
        yStart: yStart,
      });
    }
    
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
          {dataPoints.map((point, barIndex) => {
            const xOffset = barIndex * (barWidth + gapBetweenBars);
            
            return (
              <g key={barIndex}>
                {zones.slice().sort((a, b) => b.yStart - a.yStart).map((zone, zoneIndex, sortedZones) => {
                  const yStart = zone.yStart;
                  const height = zone.height;
                  const isFirst = zoneIndex === sortedZones.length - 1;
                  const isLast = zoneIndex === 0;
                  
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
                
                <rect
                  x={xOffset}
                  y={0}
                  width={barWidth}
                  height={totalHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(barIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
                
                {hoveredIndex === barIndex && point.value && (
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
        
        {dataPoints.map((point, index) => {
          const xOffset = index * (barWidth + gapBetweenBars);
          const yPos = calculateYPosition(point.value);
          const color = getStatusColor(point.status);
          const isLatest = index === dataPoints.length - 1;
          const isHovered = hoveredIndex === index;
          
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
                opacity: 1,
                pointerEvents: 'none',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: isLatest ? '14px' : '12px', 
                  fontWeight: 700,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out',
                }}
              >
                {point.value}
              </Typography>
            </Box>
          );
        })}
        
        {hoveredIndex !== null && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              left: `${hoveredIndex * (barWidth + gapBetweenBars) + (barWidth / 2)}px`,
              top: '-80px',
              transform: 'translateX(-50%)',
              p: 1.5,
              minWidth: '140px',
              textAlign: 'center',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#111827',
                fontSize: '14px',
                mb: 0.5,
              }}
            >
              {dataPoints[hoveredIndex].value} {unit}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#6B7280',
                fontSize: '12px',
                display: 'block',
              }}
            >
              {dataPoints[hoveredIndex].date}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: getStatusColor(dataPoints[hoveredIndex].status),
                fontSize: '11px',
                fontWeight: 500,
                display: 'block',
                mt: 0.5,
              }}
            >
              {dataPoints[hoveredIndex].status === 'optimal' ? 'Optimal' :
               dataPoints[hoveredIndex].status === 'in-range' ? 'In Range' : 'Out of Range'}
            </Typography>
          </Paper>
        )}
        
        {dataPoints.map((point, index) => {
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
        {zones.slice().reverse().map((zone, index) => {
          const borderColor = zone.color === '#FEE2E2' ? '#FCA5A5' : 
                             zone.color === '#D1FAE5' ? '#6EE7B7' : 
                             '#FCD34D';
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '4px',
                  backgroundColor: zone.color,
                  border: `1px solid ${borderColor}`,
                }}
              />
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#111827',
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
          );
        })}
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
          {dataPoints[dataPoints.length - 1]?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>
    </Box>
  );
}
