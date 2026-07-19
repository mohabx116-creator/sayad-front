import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconHierarchy2, IconLock, IconPlus } from '@tabler/icons-react';
import { FormattedMessage } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

export default function AccountingHomePage() {
  return (
    <Box>
      <Breadcrumbs custom heading="general-ledger" links={[{ title: 'general-ledger' }]} />
      <Stack spacing={3}>
        <PageTitle>
          <FormattedMessage id="general-ledger" defaultMessage="General Ledger" />
        </PageTitle>
        <MainCard contentSX={{ p: 0 }}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: 'primary.lighter',
              background: 'linear-gradient(135deg, rgba(94,114,228,0.12) 0%, rgba(255,255,255,0.95) 100%)'
            }}
          >
            <Stack spacing={2} sx={{ maxWidth: 760 }}>
              <Typography variant="overline" color="primary.main" letterSpacing={1.5}>
                <FormattedMessage id="accounting" defaultMessage="Accounting" />
              </Typography>
              <Typography variant="h2" fontWeight={800}>
                <FormattedMessage id="chart-of-accounts" defaultMessage="Chart of Accounts" />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <FormattedMessage
                  id="accounting-home-description"
                  defaultMessage="Start from the chart of accounts to manage the accounting structure, then open any account to inspect its path and properties or create child accounts."
                />
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <Button component={Link} to="/accounting/chart-of-accounts" variant="contained" startIcon={<IconHierarchy2 size={18} />}>
                  <FormattedMessage id="chart-of-accounts" defaultMessage="Chart of Accounts" />
                </Button>
                <Button component={Link} to="/accounting/journal-entries" variant="outlined">
                  <FormattedMessage id="journal-entries" defaultMessage="Journal Entries" />
                </Button>
                <Button component={Link} to="/accounting/year-end-closing" variant="outlined" startIcon={<IconLock size={18} />}>
                  <FormattedMessage id="year-end-closing" defaultMessage="Year-End Closing" />
                </Button>
                <Button component={Link} to="/accounting/chart-of-accounts/new" variant="outlined" startIcon={<IconPlus size={18} />}>
                  <FormattedMessage id="create-account" defaultMessage="Create Account" />
                </Button>
              </Stack>
            </Stack>
          </Box>
        </MainCard>
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              <FormattedMessage id="accounting-workflow" defaultMessage="Workflow" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage
                id="accounting-workflow-description"
                defaultMessage="Create accounts, organize them into hierarchical levels, activate or deactivate them, and safely delete them when they have no children."
              />
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
