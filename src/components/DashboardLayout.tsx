'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Tooltip } from '@mui/material';

const SIDEBAR_WIDTH = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
  selectedMenuItem?: string;
  onMenuItemClick?: (item: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function DashboardLayout({ 
  children, 
  selectedMenuItem = 'dashboard',
  onMenuItemClick,
  onRefresh,
  refreshing = false,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuItemClick = (item: string) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, active: true },
    { id: 'metabolic', label: 'Metabolic', icon: DashboardIcon, active: true },
    { id: 'creatine', label: 'Creatine', icon: DashboardIcon, active: true },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isMobile && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-start' }}>
          <IconButton onClick={handleDrawerToggle} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            L
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>
              lorem
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '12px' }}>
              Lorem ipsum
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isSelected = selectedMenuItem === item.id;
          const Icon = item.icon;
          
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => item.active && handleMenuItemClick(item.id)}
                disabled={!item.active}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#F3F4F6' : 'transparent',
                  color: item.active ? (isSelected ? '#111827' : '#6B7280') : '#9CA3AF',
                  '&:hover': {
                    backgroundColor: item.active ? '#F3F4F6' : 'transparent',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#7C3AED',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            U
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
              User
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '12px' }}>
              Member
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: '8px',
              py: 1,
              color: '#6B7280',
              '&:hover': {
                backgroundColor: '#F3F4F6',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItemButton>
          <ListItemButton
            sx={{
              borderRadius: '8px',
              py: 1,
              color: '#6B7280',
              '&:hover': {
                backgroundColor: '#F3F4F6',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFBFC' }}>
      <Box
        component="nav"
        sx={{
          width: { md: SIDEBAR_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: SIDEBAR_WIDTH,
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: SIDEBAR_WIDTH,
              backgroundColor: '#F9FAFB',
              borderRight: '1px solid #E5E7EB',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: '#111827' }}
              >
                <DashboardIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                color: '#111827',
                fontSize: '18px',
              }}
            >
              DASHBOARD
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: 4, backgroundColor: '#FAFBFC' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
