'use client';

import React, { useEffect } from 'react';
import { Modal, Box, IconButton, Typography, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BiomarkerData } from '@/src/lib/types';
import MetabolicHealthGraph from './metabolic/Graph';
import CreatineGraph from './creatine/Graph';

interface BiomarkerModalProps {
  data: BiomarkerData | null;
  onClose: () => void;
}

export default function BiomarkerModal({ data, onClose }: BiomarkerModalProps) {
  useEffect(() => {
    if (data) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [data]);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && data) {
        onClose();
      }
    };
    
    if (data) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [data, onClose]);
  
  if (!data) return null;
  
  return (
    <Modal
      open={!!data}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          outline: 'none',
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            from: {
              opacity: 0,
              transform: 'scale(0.95)',
            },
            to: {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#111827',
                fontSize: '24px',
              }}
            >
              {data.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                mt: 0.5,
                fontSize: '14px',
              }}
            >
              Biomarker Details
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#9CA3AF',
              '&:hover': {
                color: '#4B5563',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 4 }}>
          {data.name === 'Metabolic Health Score' ? (
            <MetabolicHealthGraph data={data} />
          ) : (
            <CreatineGraph data={data} />
          )}
          
          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#111827',
                mb: 1,
                fontSize: '16px',
              }}
            >
              About this biomarker
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#4B5563',
                fontSize: '14px',
              }}
            >
              {data.name} is measured in {data.unit}. Your current value is {data.value} {data.unit}.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}
