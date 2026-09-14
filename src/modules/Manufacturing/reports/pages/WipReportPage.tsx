import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';

import { useManufacturingWipReport } from '../hooks/useManufacturingReports';
import WipTable from '../components/WipTable';

const WipReportPage = () => {
  const intl = useIntl();
  const { wipReport, isLoading, error } = useManufacturingWipReport();

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="wip-report"
        links={[
          { title: 'manufacturing', to: '/manufacturing' },
          { title: 'manufacturing-reports', to: '/manufacturing/reports/wip' },
          { title: 'wip-report' }
        ]}
      />
      <Stack spacing={3}>
        <Box>
          <PageTitle>
            <FormattedMessage id="wip-report" defaultMessage="WIP Report" />
          </PageTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <FormattedMessage
              id="wip-report-description"
              defaultMessage="Detailed tracking of accrued material, labor, and overhead in active production orders."
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

        {isLoading && !wipReport && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {wipReport && <WipTable data={wipReport} />}
      </Stack>
    </Box>
  );
};

export default WipReportPage;
