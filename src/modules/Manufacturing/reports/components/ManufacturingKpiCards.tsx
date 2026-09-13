import Grid from '@mui/material/GridLegacy';
import { useIntl } from 'react-intl';
import MainCard from 'ui-component/cards/MainCard';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FactoryIcon from '@mui/icons-material/Factory';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ManufacturingDashboardDto } from '../types/manufacturingReports.types';

interface Props {
  data?: ManufacturingDashboardDto;
}

const ManufacturingKpiCards = ({ data }: Props) => {
  const intl = useIntl();

  if (!data) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'active-orders', defaultMessage: 'Active Orders' })}
          iconPrimary={ListAltIcon}
          primary={data.activeOrdersCount}
          secondary={intl.formatMessage({ id: 'total-active', defaultMessage: 'Total Active' })}
          color="primary.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'released-orders', defaultMessage: 'Released Orders' })}
          iconPrimary={FactoryIcon}
          primary={data.releasedOrdersCount}
          secondary={intl.formatMessage({ id: 'ready-to-start', defaultMessage: 'Ready to Start' })}
          color="info.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'in-progress-orders', defaultMessage: 'In Progress Orders' })}
          iconPrimary={SettingsIcon}
          primary={data.inProgressOrdersCount}
          secondary={intl.formatMessage({ id: 'currently-running', defaultMessage: 'Currently Running' })}
          color="warning.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'completed-today', defaultMessage: 'Completed Today' })}
          iconPrimary={CheckCircleIcon}
          primary={data.completedTodayCount}
          secondary={intl.formatMessage({ id: 'today', defaultMessage: 'Today' })}
          color="success.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'wip-value', defaultMessage: 'WIP Value' })}
          iconPrimary={AttachMoneyIcon}
          primary={data.totalWipValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          secondary={intl.formatMessage({ id: 'work-in-progress', defaultMessage: 'Work in Progress' })}
          color="error.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'monthly-production-cost', defaultMessage: 'Monthly Cost' })}
          iconPrimary={AttachMoneyIcon}
          primary={data.currentMonthProductionCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          secondary={intl.formatMessage({ id: 'this-month', defaultMessage: 'This Month' })}
          color="secondary.main"
        />
      </Grid>
    </Grid>
  );
};

export default ManufacturingKpiCards;
