import { useIntl } from 'react-intl';
import { Typography, CircularProgress, Box } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import MainCard from 'ui-component/cards/MainCard';
import { useManufacturingDashboard } from '../hooks/useManufacturingReports';
import ManufacturingKpiCards from '../components/ManufacturingKpiCards';
import ProductionStatusChart from '../components/ProductionStatusChart';

const ManufacturingDashboardPage = () => {
  const intl = useIntl();
  const { dashboard, isLoading, error } = useManufacturingDashboard();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Typography color="error">{intl.formatMessage({ id: 'error-loading-data', defaultMessage: 'Error loading data.' })}</Typography>
      </MainCard>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">{intl.formatMessage({ id: 'manufacturing-dashboard', defaultMessage: 'Manufacturing Dashboard' })}</Typography>
      </Grid>
      <Grid item xs={12}>
        <ManufacturingKpiCards data={dashboard} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ProductionStatusChart data={dashboard} />
      </Grid>
    </Grid>
  );
};

export default ManufacturingDashboardPage;
