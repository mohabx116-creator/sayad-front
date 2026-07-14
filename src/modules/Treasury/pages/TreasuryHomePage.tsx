import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/GridLegacy';
import Typography from '@mui/material/Typography';
import { IconArrowRight, IconBuildingBank, IconReceipt, IconReceiptRefund, IconArrowsRightLeft, IconReportAnalytics } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';

const tiles = [
  {
    titleId: 'treasury-accounts',
    descriptionId: 'treasury-home.accounts-desc',
    href: '/treasury/accounts',
    icon: IconBuildingBank
  },
  {
    titleId: 'receipts',
    descriptionId: 'treasury-home.receipts-desc',
    href: '/treasury/receipts',
    icon: IconReceipt
  },
  {
    titleId: 'payments',
    descriptionId: 'treasury-home.payments-desc',
    href: '/treasury/payments',
    icon: IconReceiptRefund
  },
  {
    titleId: 'transfers',
    descriptionId: 'treasury-home.transfers-desc',
    href: '/treasury/transfers',
    icon: IconArrowsRightLeft
  },
  {
    titleId: 'statements',
    descriptionId: 'treasury-home.statements-desc',
    href: '/treasury/statements',
    icon: IconReportAnalytics
  }
];

export default function TreasuryHomePage() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="treasury" links={[{ title: 'treasury' }]} sx={{ mb: 0 }} />
        <PageTitle>
          <FormattedMessage id="treasury" defaultMessage="الخزينة" />
        </PageTitle>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <FormattedMessage id="treasury-home.subtitle" defaultMessage="إدارة الحسابات والحركات والبيانات المرتبطة بالخزينة." />
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Grid key={tile.href} item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.lighter', color: 'primary.main' }}>
                      <Icon size={22} />
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                      <FormattedMessage id={tile.titleId} />
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id={tile.descriptionId} defaultMessage="عرض وإدارة السجلات." />
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3 }}>
                  <Button component={Link} to={tile.href} endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="view-all" defaultMessage="عرض الكل" />
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
