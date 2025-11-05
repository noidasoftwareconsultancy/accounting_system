import { createTheme } from '@mui/material/styles';

// CRO-optimized theme with focus on clarity, trust, and conversion
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Strong blue - creates trust in financial applications
      light: '#60A5FA',
      dark: '#1E40AF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981', // Success green - positive financial outcomes
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444', // Clear red for errors
      light: '#F87171',
      dark: '#B91C1C',
    },
    warning: {
      main: '#F59E0B', // Amber for warnings
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6', // Light blue for information
      light: '#60A5FA',
      dark: '#2563EB',
    },
    success: {
      main: '#10B981', // Green for success messages
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F9FAFB', // Light gray background for readability
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937', // Dark gray for primary text - high readability
      secondary: '#6B7280', // Medium gray for secondary text
      disabled: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none', // CRO: Avoid all caps for better readability
    },
  },
  shape: {
    borderRadius: 8, // Consistent rounded corners
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 6px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 12px rgba(0, 0, 0, 0.05)',
    '0px 12px 16px rgba(0, 0, 0, 0.05)',
    '0px 14px 20px rgba(0, 0, 0, 0.05)',
    '0px 16px 24px rgba(0, 0, 0, 0.05)',
    '0px 18px 28px rgba(0, 0, 0, 0.05)',
    '0px 20px 32px rgba(0, 0, 0, 0.05)',
    '0px 22px 36px rgba(0, 0, 0, 0.05)',
    '0px 24px 40px rgba(0, 0, 0, 0.05)',
    '0px 26px 44px rgba(0, 0, 0, 0.05)',
    '0px 28px 48px rgba(0, 0, 0, 0.05)',
    '0px 30px 52px rgba(0, 0, 0, 0.05)',
    '0px 32px 56px rgba(0, 0, 0, 0.05)',
    '0px 34px 60px rgba(0, 0, 0, 0.05)',
    '0px 36px 64px rgba(0, 0, 0, 0.05)',
    '0px 38px 68px rgba(0, 0, 0, 0.05)',
    '0px 40px 72px rgba(0, 0, 0, 0.05)',
    '0px 42px 76px rgba(0, 0, 0, 0.05)',
    '0px 44px 80px rgba(0, 0, 0, 0.05)',
    '0px 46px 84px rgba(0, 0, 0, 0.05)',
    '0px 48px 88px rgba(0, 0, 0, 0.05)',
    '0px 50px 92px rgba(0, 0, 0, 0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)', // Gradient for primary buttons - increases CTR
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #059669 30%, #10B981 90%)', // Gradient for secondary buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F3F4F6', // Light gray background for table headers
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#F9FAFB', // Zebra striping for better readability
          },
          '&:hover': {
            backgroundColor: '#F3F4F6', // Highlight on hover
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;