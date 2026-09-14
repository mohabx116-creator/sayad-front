import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';

import { useManufacturingDashboard } from '../hooks/useManufacturingReports';
import ManufacturingKpiCards from '../components/ManufacturingKpiCards';
import ProductionStatusChart from '../components/ProductionStatusChart';

const ManufacturingDashboardPage = () => {
  const intl = useIntl();
  const { dashboard, isLoading, error } = useManufacturingDashboard();

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="manufacturing-dashboard"
        links={[
          { title: 'manufacturing', to: '/manufacturing' },
          { title: 'manufacturing-reports', to: '/manufacturing/dashboard' },
          { title: 'manufacturing-dashboard' }
        ]}
      />
      <Stack spacing={3}>
        <Box>
          <PageTitle>
            <FormattedMessage id="manufacturing-dashboard" defaultMessage="Manufacturing Dashboard" />
          </PageTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <FormattedMessage
              id="manufacturing-dashboard-description"
              defaultMessage="Real-time production KPIs, WIP metrics, and manufacturing throughput."
            />
          </Typography>
        </Box>

        {error && (
          <Alert severity="error">
            {error instanceof Error
              ? error.message
              : intl.formatMessage({ id: 'error-loading-data', defaultMessage: 'Error loading data.' })}
          </Alert>
        )}

        {isLoading && !dashboard && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {dashboard && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ManufacturingKpiCards data={dashboard} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProductionStatusChart data={dashboard} />
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default ManufacturingDashboardPage;
