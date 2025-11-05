
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  ArrowForward
} from '@mui/icons-material';

const ProgressCard = ({ 
  title, 
  description, 
  progress, 
  target, 
  current, 
  unit = '', 
  color = 'primary',
  actionLabel,
  onAction 
}) => {
  const theme = useTheme();
  const progressPercentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = progressPercentage >= 100;

  return (
    <Card sx={{ 
      borderRadius: 3,
      border: `1px solid ${theme.palette[color].main}20`,
      '&:hover': {
        boxShadow: theme.shadows[4],
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          </Box>
          <Chip
            icon={isCompleted ? <CheckCircle /> : <Schedule />}
            label={isCompleted ? 'Complete' : 'In Progress'}
            size="small"
            color={isCompleted ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {current}{unit} / {target}{unit}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            color={color}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: `${theme.palette[color].main}15`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ mt: 0.5, display: 'block' }}
          >
            {progressPercentage.toFixed(1)}% complete
          </Typography>
        </Box>

        {actionLabel && onAction && (
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={onAction}
            sx={{ textTransform: 'none' }}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCard;