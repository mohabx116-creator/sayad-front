import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import MainCard from 'ui-component/cards/MainCard';
import Grid from '@mui/material/GridLegacy';
import { IconArrowDownLeft, IconArrowUpRight, IconWallet, IconChartLine } from '@tabler/icons-react';

import { formatTreasuryMoney } from '../utils/treasury.format';

interface Props {
  openingBalance: number;
  totalReceipts: number;
  totalPayments: number;
  netMovement?: number;
  closingBalance: number;
  currencyCode?: string;
}

interface StatCardProps {
  label: React.ReactNode;
  amount: number;
  currencyCode: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

function StatCard({ label, amount, currencyCode, color, bgColor, borderColor, icon }: StatCardProps) {
  return (
    <MainCard
      content={false}
      sx={{
        border: '1px solid',
        borderColor,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: bgColor,
              display: 'grid',
              placeItems: 'center',
              color
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h3" fontWeight={800} color={color}>
            {formatTreasuryMoney(amount, currencyCode)}
          </Typography>
        </Box>
      </Box>
    </MainCard>
  );
}

export default function TreasuryBalanceSummary({ openingBalance, totalReceipts, totalPayments, netMovement, closingBalance, currencyCode = 'EGP' }: Props) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label={<FormattedMessage id="opening-balance" defaultMessage="الرصيد الافتتاحي" />}
          amount={openingBalance}
          currencyCode={currencyCode}
          color="text.primary"
          bgColor="grey.100"
          borderColor="divider"
          icon={<IconWallet size={18} />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label={<FormattedMessage id="total-receipts" defaultMessage="إجمالي المقبوضات" />}
          amount={totalReceipts}
          currencyCode={currencyCode}
          color="success.dark"
          bgColor="success.lighter"
          borderColor="success.light"
          icon={<IconArrowDownLeft size={18} color="var(--mui-palette-success-dark)" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label={<FormattedMessage id="total-payments" defaultMessage="إجمالي المدفوعات" />}
          amount={totalPayments}
          currencyCode={currencyCode}
          color="error.dark"
          bgColor="error.lighter"
          borderColor="error.light"
          icon={<IconArrowUpRight size={18} color="var(--mui-palette-error-dark)" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MainCard
          content={false}
          sx={{
            border: '1px solid',
            borderColor: 'primary.main',
            boxShadow: '0 4px 16px rgba(94,114,228,0.18)',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="body2" color="rgba(255,255,255,0.85)" fontWeight={600}>
                <FormattedMessage id="closing-balance" defaultMessage="الرصيد الختامي" />
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff'
                }}
              >
                <IconChartLine size={18} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h3" fontWeight={800} color="#fff">
                {formatTreasuryMoney(closingBalance, currencyCode)}
              </Typography>
            </Box>
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label={<FormattedMessage id="net-movement" defaultMessage="صافي الحركة" />}
          amount={netMovement ?? (totalReceipts - totalPayments)}
          currencyCode={currencyCode}
          color="primary.dark"
          bgColor="primary.lighter"
          borderColor="primary.light"
          icon={<IconChartLine size={18} color="var(--mui-palette-primary-dark)" />}
        />
      </Grid>
    </Grid>
  );
}
