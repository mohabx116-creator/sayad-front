import { useIntl } from 'react-intl';
import { Typography, CircularProgress, Box } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import MainCard from 'ui-component/cards/MainCard';
import { useManufacturingWipReport } from '../hooks/useManufacturingReports';
import WipTable from '../components/WipTable';

const WipReportPage = () => {
  const intl = useIntl();
  const { wipReport, isLoading, error } = useManufacturingWipReport();

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
        <Typography variant="h3">{intl.formatMessage({ id: 'wip-report', defaultMessage: 'WIP Report' })}</Typography>
      </Grid>
      <Grid item xs={12}>
        <WipTable data={wipReport} />
      </Grid>
    </Grid>
  );
};

export default WipReportPage;
