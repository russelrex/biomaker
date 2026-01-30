'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Alert,
  Button,
  Skeleton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupIcon from '@mui/icons-material/Group';
import ScienceIcon from '@mui/icons-material/Science';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DashboardLayout from '@/src/components/DashboardLayout';
import MetricCard from '@/src/components/MetricCard';
import MetricCardSkeleton from '@/src/components/MetricCardSkeleton';
import StatCard from '@/src/components/StatCard';
import BiomarkerModal from '@/src/components/BiomarkerModal';
import { BiomarkerData } from '@/src/lib/types';
import { fetchBiomarkerData } from '@/src/lib/dataService';
import { createBiomarkerData } from '@/src/lib/parseBiomarkerData';

function calculateGrowthPercentage(value: number, optimalRange?: [number, number]): string {
  if (!optimalRange) return '+0%';
  const [min, max] = optimalRange;
  const midpoint = (min + max) / 2;
  const percentage = ((value - midpoint) / midpoint) * 100;
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${Math.round(percentage)}%`;
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  return date.toLocaleString();
}

export default function Home() {
  const [biomarkers, setBiomarkers] = useState<BiomarkerData[]>([]);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const metabolicRef = useRef<HTMLDivElement>(null);
  const creatinineRef = useRef<HTMLDivElement>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const csvData = await fetchBiomarkerData();
      
      if (!csvData || csvData.length === 0) {
        throw new Error('No data received from CSV');
      }
      
      const validRows = csvData.filter(row => {
        const name = row.Biomarker_Name || (row as any)['Biomaker Name'];
        return name && typeof name === 'string' && name.trim().length > 0;
      });
      
      const filteredRows = validRows.filter(row => {
        const name = (row.Biomarker_Name || (row as any)['Biomaker Name'])?.trim();
        return name && !name.includes('Graph Value') && !name.toLowerCase().includes('value:');
      });
      
      console.log('CSV Data received:', csvData.length, 'total rows');
      console.log('Valid rows:', validRows.length);
      console.log('Filtered rows (excluding Graph Value):', filteredRows.length);
      console.log('Available biomarkers:', filteredRows.map(r => r.Biomarker_Name || (r as any)['Biomaker Name']));
      
      const metabolicHealth = filteredRows.find(row => {
        const name = (row.Biomarker_Name || (row as any)['Biomaker Name'])?.trim();
        return name === 'Metabolic Health Score' || (name?.startsWith('Metabolic') && !name.includes('Graph'));
      });
      
      const creatine = filteredRows.find(row => {
        const name = (row.Biomarker_Name || (row as any)['Biomaker Name'])?.trim();
        return name === 'Creatine' || name === 'Creatinine' || (name?.toLowerCase().includes('creatin') && !name.includes('Graph'));
      });
      
      if (creatine) {
        creatine.Biomarker_Name = 'Creatinine';
      }
      
      if (!metabolicHealth) {
        console.error('Metabolic Health Score not found. Available biomarkers:', 
          filteredRows.map(r => r.Biomarker_Name || (r as any)['Biomaker Name']));
      }
      
      if (!creatine) {
        console.error('Creatine not found. Available biomarkers:', 
          filteredRows.map(r => r.Biomarker_Name || (r as any)['Biomaker Name']));
      }
      
      if (!metabolicHealth || !creatine) {
        const availableNames = filteredRows.map(r => r.Biomarker_Name || (r as any)['Biomaker Name']).filter(Boolean);
        throw new Error(`Required biomarker data not found in CSV. Found ${csvData.length} total rows, ${filteredRows.length} filtered rows. Available biomarkers: ${availableNames.join(', ')}`);
      }
      
      const biomarkerInstances: BiomarkerData[] = [];
      
      const demographicKeys = ['Male_18-39', 'Male_18_39'];
      let demographic = 'Male_18-39';
      
      for (const key of demographicKeys) {
        const testKey = `${key}_Optimal`;
        if (metabolicHealth[testKey as keyof typeof metabolicHealth] || 
            metabolicHealth[testKey.replace(/-/g, '_') as keyof typeof metabolicHealth]) {
          demographic = key;
          break;
        }
      }
      
      biomarkerInstances.push(
        createBiomarkerData(metabolicHealth, 78, demographic)
      );
      
      biomarkerInstances.push(
        createBiomarkerData(creatine, 0.63, demographic)
      );
      
      setBiomarkers(biomarkerInstances);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading biomarker data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMenuItemClick = (item: string) => {
    setSelectedMenuItem(item);
    
    if (item === 'metabolic' && metabolicRef.current) {
      metabolicRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (item === 'creatine' && creatinineRef.current) {
      creatinineRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (biomarker: BiomarkerData) => {
    setSelectedBiomarker(biomarker);
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const metabolicData = biomarkers.find(b => b.name === 'Metabolic Health Score');
  const creatinineData = biomarkers.find(b => b.name === 'Creatine' || b.name === 'Creatinine');

  return (
    <DashboardLayout
      selectedMenuItem={selectedMenuItem}
      onMenuItemClick={handleMenuItemClick}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => loadData(true)}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <AnalyticsIcon />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '18px',
                  mb: 0.5,
                }}
              >
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6B7280',
                    fontSize: '14px',
                  }}
                >
                  Real-time business insights
                </Typography>
                {lastUpdated && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9CA3AF',
                      fontSize: '12px',
                      ml: 1,
                    }}
                  >
                    • Updated {formatLastUpdated(lastUpdated)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Chip
            label="Live"
            size="small"
            sx={{
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              fontWeight: 500,
              '& .MuiChip-label': {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              },
            }}
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
            }
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3,
            p: 2,
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
          }}
        >
          <Tooltip title="Refresh data from Google Sheets">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing || loading}
              sx={{
                color: '#4F46E5',
                '&:hover': {
                  backgroundColor: '#EEF2FF',
                },
                '&.Mui-disabled': {
                  color: '#9CA3AF',
                },
              }}
            >
              <RefreshIcon
                sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#111827',
                fontSize: '14px',
              }}
            >
              Refresh Data
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#6B7280',
                fontSize: '12px',
              }}
            >
              {refreshing ? 'Refreshing data...' : 'Click to fetch latest data from Google Sheets'}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <MetricCardSkeleton />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <MetricCardSkeleton />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {metabolicData && (
                <Box ref={metabolicRef}>
                  <StatCard
                    data={metabolicData}
                    onClick={() => handleCardClick(metabolicData)}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {creatinineData && (
                <Box ref={creatinineRef}>
                  <StatCard
                    data={creatinineData}
                    onClick={() => handleCardClick(creatinineData)}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <BiomarkerModal
        data={selectedBiomarker}
        onClose={() => setSelectedBiomarker(null)}
      />
    </DashboardLayout>
  );
}
