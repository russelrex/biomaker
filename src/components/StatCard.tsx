'use client';

import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import GroupIcon from '@mui/icons-material/Group';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { BiomarkerData } from '@/src/lib/types';

interface StatCardProps {
  data: BiomarkerData;
  onClick: () => void;
}

export default function StatCard({ data, onClick }: StatCardProps) {
  const { name, value, unit, status, ranges, graphMin, graphMax } = data;
  
  const isCreatinine = name === 'Creatine' || name === 'Creatinine';
  const isMetabolic = name === 'Metabolic Health Score';
  
  const getStatusColor = () => {
    return status === 'optimal' ? '#10B981' : 
           status === 'in-range' ? '#F59E0B' : '#EF4444';
  };
  
  const getStatusLabel = () => {
    return status === 'optimal' ? 'Optimal' : 
           status === 'in-range' ? 'In range' : 'Out of range';
  };
  
  const getStatusBadgeColor = () => {
    if (status === 'optimal') {
      return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' };
    } else if (status === 'in-range') {
      return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' };
    } else {
      return { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' };
    }
  };
  
  const getCardThemeColor = () => {
    if (isCreatinine) {
      return '#3B82F6';
    }
    if (isMetabolic) {
      return '#10B981';
    }
    return '#10B981';
  };
  
  const getIcon = () => {
    if (isCreatinine) {
      return <ScienceIcon />;
    }
    if (isMetabolic) {
      return <GroupIcon />;
    }
    return <ScienceIcon />;
  };
  
  const getDescription = () => {
    if (isCreatinine) {
      return 'Monitor kidney function levels';
    }
    if (isMetabolic) {
      return 'Track your metabolic health status';
    }
    return '';
  };
  
  const calculateGrowthPercentage = (): string => {
    if (!ranges.optimal) return '+0%';
    const [min, max] = ranges.optimal;
    const midpoint = (min + max) / 2;
    const percentage = ((value - midpoint) / midpoint) * 100;
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${Math.round(percentage)}%`;
  };
  
  const position = ((value - graphMin) / (graphMax - graphMin)) * 100;
  
  const zones: Array<{ color: string; width: string; start: number }> = [];
  let currentStart = 0;
  
  if (isCreatinine) {
    const redLowEnd = 0.7;
    const greenOptimalStart = 0.7;
    const greenOptimalEnd = 1.2;
    const amberInRangeStart = 1.2;
    const amberInRangeEnd = 1.5;
    const redHighStart = 1.5;
    const totalRange = graphMax - graphMin;
    
    if (graphMin < redLowEnd) {
      const width = ((redLowEnd - graphMin) / totalRange) * 100;
      zones.push({ color: '#FEE2E2', width: `${width}%`, start: currentStart });
      currentStart += width;
    }
    
    if (greenOptimalEnd > greenOptimalStart) {
      const width = ((greenOptimalEnd - greenOptimalStart) / totalRange) * 100;
      zones.push({ color: '#D1FAE5', width: `${width}%`, start: currentStart });
      currentStart += width;
    }
    
    if (amberInRangeEnd > amberInRangeStart) {
      const width = ((amberInRangeEnd - amberInRangeStart) / totalRange) * 100;
      zones.push({ color: '#FEF3C7', width: `${width}%`, start: currentStart });
      currentStart += width;
    }
    
    if (graphMax > redHighStart) {
      const width = ((graphMax - redHighStart) / totalRange) * 100;
      zones.push({ color: '#FEE2E2', width: `${width}%`, start: currentStart });
    }
  } else {
    if (ranges.outOfRange) {
      const [min, max] = ranges.outOfRange;
      if (min < (ranges.inRange?.[0] ?? ranges.optimal?.[0] ?? Infinity)) {
        const endPoint = ranges.inRange?.[0] ?? ranges.optimal?.[0] ?? max;
        const width = ((endPoint - graphMin) / (graphMax - graphMin)) * 100;
        zones.push({ color: '#EF4444', width: `${width}%`, start: currentStart });
        currentStart += width;
      }
    }
    
    if (ranges.inRange) {
      const [min, max] = ranges.inRange;
      const width = ((max - min) / (graphMax - graphMin)) * 100;
      zones.push({ color: '#F59E0B', width: `${width}%`, start: currentStart });
      currentStart += width;
    }
    
    if (ranges.optimal) {
      const [min, max] = ranges.optimal;
      const width = ((max - min) / (graphMax - graphMin)) * 100;
      zones.push({ color: '#10B981', width: `${width}%`, start: currentStart });
      currentStart += width;
    }
    
    if (ranges.outOfRange) {
      const [min, max] = ranges.outOfRange;
      const upperBound = ranges.optimal?.[1] ?? ranges.inRange?.[1];
      if (upperBound && max > upperBound) {
        const width = ((graphMax - upperBound) / (graphMax - graphMin)) * 100;
        zones.push({ color: '#EF4444', width: `${width}%`, start: currentStart });
      }
    }
  }
  
  const markerColor = getStatusColor();
  const statusBadge = getStatusBadgeColor();
  const themeColor = getCardThemeColor();
  const growthPercent = calculateGrowthPercentage();
  const isNegativeGrowth = growthPercent.startsWith('-');
  const GrowthIcon = isNegativeGrowth ? TrendingDownIcon : TrendingUpIcon;
  const growthColor = isNegativeGrowth ? '#EF4444' : themeColor;
  
  if (isCreatinine || isMetabolic) {
    return (
      <Card
        onClick={onClick}
        sx={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 200ms ease-in-out',
          backgroundColor: '#FFFFFF',
          borderTop: '4px solid',
          borderTopColor: themeColor,
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: themeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                {getIcon()}
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: '16px',
                    mb: 0.5,
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6B7280',
                    fontSize: '14px',
                  }}
                >
                  {getDescription()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GrowthIcon sx={{ fontSize: '16px', color: growthColor }} />
              <Typography
                variant="body2"
                sx={{
                  color: growthColor,
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {growthPercent}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                backgroundColor: statusBadge.bg,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: statusBadge.dot,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: statusBadge.text,
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {getStatusLabel()}
              </Typography>
            </Box>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 80,
                borderRadius: '8px',
                border: '2px solid',
                borderColor: markerColor,
                backgroundColor: statusBadge.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: markerColor,
                  lineHeight: 1,
                }}
              >
                {value}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '14px',
                  color: '#6B7280',
                  mt: 0.5,
                }}
              >
                {unit}
              </Typography>
            </Box>
          </Box>
          
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '8px',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
              mb: 2,
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                backgroundColor: markerColor,
                zIndex: 10,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: '#6B7280',
                fontSize: '12px',
              }}
            >
              This month
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontSize: '12px',
                }}
              >
                Active
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: '#111827',
                  fontSize: '14px',
                }}
              >
                {name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: markerColor,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#374151',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {getStatusLabel()}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '20px',
                  lineHeight: 1.2,
                }}
              >
                {value}
                {unit && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#6B7280',
                      ml: 0.5,
                    }}
                  >
                    {unit}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
          
          <Box
            sx={{
              position: 'relative',
              width: '120px',
              height: '8px',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
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
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
