import { useIntl } from 'react-intl';
import useSWR from 'swr';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { useTheme } from '@mui/material/styles';

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import InfoIcon from '@mui/icons-material/Info';

import { getProductionOrderTimeline } from '../api/manufacturingApi';
import { ProductionActivityType, ProductionOrderActivityDto } from '../types/manufacturing.types';

interface ProductionOrderTimelineProps {
  productionOrderId: string;
}

const getActivityIcon = (type: ProductionActivityType) => {
  switch (type) {
    case 'Created':
      return <AddCircleOutlineIcon />;
    case 'Updated':
      return <EditIcon />;
    case 'Approved':
      return <CheckCircleOutlineIcon />;
    case 'Released':
      return <PlayCircleOutlineIcon />;
    case 'MaterialIssued':
      return <LocalShippingIcon />;
    case 'GoodsReceived':
      return <AssignmentReturnedIcon />;
    case 'CostRecalculated':
      return <MonetizationOnIcon />;
    case 'Cancelled':
      return <CancelIcon />;
    case 'Closed':
      return <TaskAltIcon />;
    default:
      return <InfoIcon />;
  }
};

const getActivityColor = (type: ProductionActivityType, theme: any) => {
  switch (type) {
    case 'Created':
      return theme.palette.info.main;
    case 'Updated':
      return theme.palette.warning.main;
    case 'Approved':
    case 'Released':
      return theme.palette.primary.main;
    case 'MaterialIssued':
    case 'GoodsReceived':
      return theme.palette.secondary.main;
    case 'CostRecalculated':
      return theme.palette.success.main;
    case 'Cancelled':
      return theme.palette.error.main;
    case 'Closed':
      return theme.palette.success.dark;
    default:
      return theme.palette.grey[500];
  }
};

const ProductionOrderTimeline = ({ productionOrderId }: ProductionOrderTimelineProps) => {
  const { formatMessage, formatDate, formatTime } = useIntl();
  const theme = useTheme();

  const { data: timelineData, isLoading, error } = useSWR(
    productionOrderId ? `/api/manufacturing/orders/${productionOrderId}/timeline` : null,
    () => getProductionOrderTimeline(productionOrderId)
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          {formatMessage({ id: 'manufacturing.timeline.errorLoading' })}
        </Typography>
      </Box>
    );
  }

  if (!timelineData || timelineData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          {formatMessage({ id: 'manufacturing.timeline.noActivities' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {formatMessage({ id: 'manufacturing.timeline.title' })}
      </Typography>
      <Timeline position="alternate">
        {timelineData.map((activity: ProductionOrderActivityDto, index: number) => {
          const isLast = index === timelineData.length - 1;
          const color = getActivityColor(activity.activityType, theme);
          
          return (
            <TimelineItem key={activity.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                {formatDate(activity.createdAtUtc, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
                <br />
                {formatTime(activity.createdAtUtc)}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: index === 0 ? color : undefined }} />
                <TimelineDot sx={{ bgcolor: 'background.paper', color: color, borderColor: color }} variant="outlined">
                  {getActivityIcon(activity.activityType)}
                </TimelineDot>
                {!isLast && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Typography variant="h6" component="span" color={color}>
                  {formatMessage({ id: `production-activity-type.${activity.activityType}` })}
                </Typography>
                <Typography variant="body2">{activity.description}</Typography>
                
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={`${formatMessage({ id: 'manufacturing.timeline.by' })}: ${activity.userName || activity.userId}`}
                    variant="outlined"
                  />
                  {activity.referenceType && activity.referenceId && (
                    <Chip
                      size="small"
                      color="secondary"
                      label={`${formatMessage({ id: 'manufacturing.timeline.ref' })}: ${activity.referenceType}`}
                      variant="outlined"
                    />
                  )}
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
};

export default ProductionOrderTimeline;
