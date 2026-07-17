import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
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
          <FormattedMessage id="general-ledger" defaultMessage="الحسابات العامة" />
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
                <FormattedMessage id="accounting" defaultMessage="الحسابات العامة" />
              </Typography>
              <Typography variant="h2" fontWeight={800}>
                <FormattedMessage id="chart-of-accounts" defaultMessage="شجرة الحسابات" />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <FormattedMessage
                  id="accounting-home-description"
                  defaultMessage="ابدأ من شجرة الحسابات لإدارة الهيكل المحاسبي، ثم افتح أي حساب لعرض مساره وخصائصه أو إنشاء حسابات فرعية."
                />
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <Button component={Link} to="/accounting/chart-of-accounts" variant="contained" startIcon={<IconHierarchy2 size={18} />}>
                  <FormattedMessage id="chart-of-accounts" defaultMessage="شجرة الحسابات" />
                </Button>
                <Button component={Link} to="/accounting/chart-of-accounts/new" variant="outlined" startIcon={<IconPlus size={18} />}>
                  <FormattedMessage id="create-account" defaultMessage="إضافة حساب" />
                </Button>
              </Stack>
            </Stack>
          </Box>
        </MainCard>
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              <FormattedMessage id="accounting-workflow" defaultMessage="مسار العمل" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage
                id="accounting-workflow-description"
                defaultMessage="إنشاء الحسابات، تنظيمها في مستويات هرمية، تفعيلها أو إيقافها، ثم حذفها بأمان عندما لا تكون مرتبطة بأي أبناء."
              />
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

