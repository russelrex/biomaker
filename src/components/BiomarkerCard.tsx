'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { BiomarkerData } from '@/src/lib/types';
import MiniRangeIndicator from './MiniRangeIndicator';

interface BiomarkerCardProps {
  data: BiomarkerData;
  onClick: () => void;
}

export default function BiomarkerCard({ data, onClick }: BiomarkerCardProps) {
  const statusColors = {
    'optimal': { 
      dot: '#10B981', 
      bg: '#D1FAE5', 
      border: '#A7F3D0',
      text: '#065F46',
    },
    'in-range': { 
      dot: '#F59E0B', 
      bg: '#FEF3C7', 
      border: '#FDE68A',
      text: '#92400E',
    },
    'out-of-range': { 
      dot: '#EF4444', 
      bg: '#FEE2E2', 
      border: '#FECACA',
      text: '#991B1B',
    }
  };
  
  const colors = statusColors[data.status];
  
  const getReferenceRange = () => {
    if (data.ranges.optimal) {
      const [min, max] = data.ranges.optimal;
      return `${min}-${max}`;
    }
    return 'N/A';
  };
  
  const statusLabel = data.status === 'optimal' ? 'Optimal' : 
                     data.status === 'in-range' ? 'In range' : 'Out of range';
  
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.bg,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#111827', 
                mb: 1,
                fontSize: '18px',
              }}
            >
              {data.name}
            </Typography>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '12px',
                height: '24px',
                fontWeight: 500,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: colors.dot,
                    ml: 0.5,
                  }}
                />
              }
            />
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#111827',
                fontSize: '30px',
                lineHeight: 1.2,
              }}
            >
              {data.value}
              <Typography
                component="span"
                sx={{
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#6B7280',
                  ml: 0.5,
                }}
              >
                {data.unit}
              </Typography>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                mt: 0.5,
                fontSize: '14px',
              }}
            >
              {getReferenceRange()}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <MiniRangeIndicator data={data} />
        </Box>
        
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'right',
            color: '#9CA3AF',
            mt: 1,
            fontSize: '12px',
          }}
        >
          Click to view details →
        </Typography>
      </CardContent>
    </Card>
  );
}
