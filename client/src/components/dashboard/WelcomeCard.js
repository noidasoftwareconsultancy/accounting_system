
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  Notifications,
  Star
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const WelcomeCard = ({ onGetStarted }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        border: `1px solid ${theme.palette.primary.main}20`,
        borderRadius: 3,
        mb: 3,
        overflow: 'visible',
        position: 'relative'
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                bgcolor: 'primary.main',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 600
              }}
            >
              {user?.first_name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ fontWeight: 700, mb: 0.5 }}
              >
                {getGreeting()}, {user?.first_name}! 🌟
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ready to manage your finances today?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  icon={<Star />}
                  label={user?.role || 'User'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<TrendingUp />}
                  label="Active"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{
            display: 'flex',
            gap: 1,
            flexDirection: { xs: 'row', sm: 'column' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant="contained"
              startIcon={<TrendingUp />}
              onClick={onGetStarted}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                flex: { xs: 1, sm: 'none' }
              }}
            >
              Quick Start
            </Button>
            <Button
              variant="outlined"
              startIcon={<Notifications />}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                flex: { xs: 1, sm: 'none' }
              }}
            >
              Updates
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;