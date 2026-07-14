import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import MainCard from 'ui-component/cards/MainCard';
import Grid from '@mui/material/GridLegacy';

interface Props {
  openingBalance: number;
  totalReceipts: number;
  totalPayments: number;
  closingBalance: number;
  currencyCode?: string;
}

export default function TreasuryBalanceSummary({
  openingBalance,
  totalReceipts,
  totalPayments,
  closingBalance,
  currencyCode = 'EGP'
}: Props) {
  const cardProps = {
    content: false,
    sx: {
      p: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      bgcolor: 'background.paper'
    }
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <MainCard {...cardProps}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            <FormattedMessage id="opening-balance" defaultMessage="الرصيد الافتتاحي" />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h3" fontWeight={700}>{openingBalance.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{currencyCode}</Typography>
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MainCard {...cardProps}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            <FormattedMessage id="total-receipts" defaultMessage="إجمالي المقبوضات" />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h3" fontWeight={700} color="success.main">{totalReceipts.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{currencyCode}</Typography>
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MainCard {...cardProps}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            <FormattedMessage id="total-payments" defaultMessage="إجمالي المدفوعات" />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h3" fontWeight={700} color="error.main">{totalPayments.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{currencyCode}</Typography>
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MainCard {...cardProps} sx={{ ...cardProps.sx, bgcolor: 'primary.light', borderColor: 'primary.main' }}>
          <Typography variant="body2" color="primary.dark" fontWeight={600} gutterBottom>
            <FormattedMessage id="closing-balance" defaultMessage="الرصيد الختامي / الحالي" />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h3" fontWeight={800} color="primary.dark">{closingBalance.toFixed(2)}</Typography>
            <Typography variant="caption" color="primary.main" fontWeight={700}>{currencyCode}</Typography>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}
