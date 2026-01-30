'use client';

import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

export default function MetricCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        borderTop: '4px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: '12px' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
          </Box>
        </Box>

        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2, flex: 1 }} />

        <Box
          sx={{
            border: '2px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: '#F9FAFB',
            p: 2,
            mb: 2,
            textAlign: 'center',
          }}
        >
          <Skeleton variant="text" width="50%" height={40} sx={{ mx: 'auto' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="text" width={60} height={16} />
        </Box>
      </CardContent>
    </Card>
  );
}
