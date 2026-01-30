'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import ScienceIcon from '@mui/icons-material/Science';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  growth: string;
  description: string;
  themeColor: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function MetricCard({
  title,
  value,
  unit,
  growth,
  description,
  themeColor,
  icon,
  onClick,
}: MetricCardProps) {
  const lightColor = themeColor === '#10B981' 
    ? '#D1FAE5' 
    : '#DBEAFE';
  const borderColor = themeColor === '#10B981'
    ? '#10B981'
    : '#3B82F6';

  return (
    <Card
      onClick={onClick}
      sx={{
        position: 'relative',
        borderRadius: '12px',
        borderTop: `4px solid ${borderColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: themeColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#111827',
                fontSize: '16px',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: '14px', color: themeColor }} />
              <Typography
                variant="body2"
                sx={{
                  color: themeColor,
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {growth}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#6B7280',
            fontSize: '14px',
            mb: 2,
            flex: 1,
          }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            backgroundColor: lightColor,
            p: 2,
            mb: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#111827',
              fontSize: '32px',
              lineHeight: 1.2,
            }}
          >
            {value}
            <Typography
              component="span"
              sx={{
                fontSize: '18px',
                fontWeight: 400,
                color: '#6B7280',
                ml: 0.5,
              }}
            >
              {unit}
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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
