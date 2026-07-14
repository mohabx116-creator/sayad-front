import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import type { ComponentType, ReactNode } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import {
  IconArrowRight,
  IconBuildingBank,
  IconReceipt,
  IconReceiptRefund,
  IconArrowsRightLeft,
  IconReportAnalytics,
  IconWallet
} from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';

import { useTreasuryDashboardSummary } from '../hooks/useTreasury';
import { formatTreasuryMoney } from '../utils/treasury.format';

const tiles = [
  {
    titleId: 'treasury-accounts',
    descriptionId: 'treasury-home.accounts-desc',
    href: '/treasury/accounts',
    icon: IconBuildingBank,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#764ba2'
  },
  {
    titleId: 'receipts',
    descriptionId: 'treasury-home.receipts-desc',
    href: '/treasury/receipts',
    icon: IconReceipt,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: '#11998e'
  },
  {
    titleId: 'payments',
    descriptionId: 'treasury-home.payments-desc',
    href: '/treasury/payments',
    icon: IconReceiptRefund,
    gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
    color: '#f857a6'
  },
  {
    titleId: 'transfers',
    descriptionId: 'treasury-home.transfers-desc',
    href: '/treasury/transfers',
    icon: IconArrowsRightLeft,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f5576c'
  },
  {
    titleId: 'statements',
    descriptionId: 'treasury-home.statements-desc',
    href: '/treasury/statements',
    icon: IconReportAnalytics,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  }
];

const summaryTiles = [
  {
    label: 'إجمالي الرصيد الحالي',
    valueKey: 'totalCurrentBalance' as const,
    icon: IconWallet,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    label: 'رصيد الصندوق',
    valueKey: 'cashboxBalance' as const,
    icon: IconBuildingBank,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  {
    label: 'رصيد الحسابات البنكية',
    valueKey: 'bankAccountBalance' as const,
    icon: IconBuildingBank,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },

  {
    label: 'إجمالي المقبوضات',
    valueKey: 'periodReceipts' as const,
    icon: IconReceipt,
    gradient: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)'
  },
  {
    label: 'إجمالي المدفوعات',
    valueKey: 'periodPayments' as const,
    icon: IconReceiptRefund,
    gradient: 'linear-gradient(135deg, #ff5858 0%, #f857a6 100%)'
  }
];

function SummaryCard({
  label,
  value,
  icon: Icon,
  gradient
}: {
  label: ReactNode;
  value: number;
  icon: ComponentType<{ size?: number; color?: string }>;
  gradient: string;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ height: 4, background: gradient }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {formatTreasuryMoney(value)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: gradient,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              flexShrink: 0
            }}
          >
            <Icon size={24} color="#fff" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function TreasuryHomePage() {
  const { summary, isLoading, error } = useTreasuryDashboardSummary();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="treasury" links={[{ title: 'treasury' }]} sx={{ mb: 0 }} />
        <PageTitle>
          <FormattedMessage id="treasury" defaultMessage="الخزينة" />
        </PageTitle>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <FormattedMessage id="treasury-home.subtitle" defaultMessage="إدارة أرصدة الخزينة والمستندات والتحويلات وكشوف الحساب." />
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={4} />
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" height={40} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : error ? (
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 3, bgcolor: 'error.lighter' }}>
                <CardContent>
                  <Typography color="error.dark" fontWeight={600}>
                    <FormattedMessage id="treasury.summary-load-error" defaultMessage="تعذر تحميل ملخص الخزينة." />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : summary ? (
            summaryTiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <Grid key={tile.valueKey} item xs={12} sm={index < 4 ? 6 : 12} md={index < 3 ? 4 : 6}>
                  <SummaryCard
                    label={tile.label}
                    value={summary[tile.valueKey]}
                    icon={Icon}
                    gradient={tile.gradient}
                  />
                </Grid>
              );
            })
          ) : null}
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Grid key={tile.href} item xs={12} sm={6} md={4} lg={4}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    borderColor: 'transparent'
                  }
                }}
              >
                <Box sx={{ height: 4, background: tile.gradient }} />

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        background: tile.gradient,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        boxShadow: `0 6px 16px ${tile.color}40`
                      }}
                    >
                      <Icon size={26} color="#fff" />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                        <FormattedMessage id={tile.titleId} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        <FormattedMessage id={tile.descriptionId} defaultMessage="عرض وإدارة السجلات." />
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={Link}
                      to={tile.href}
                      size="small"
                      endIcon={<IconArrowRight size={15} />}
                      sx={{
                        color: tile.color,
                        fontWeight: 600,
                        px: 0,
                        '&:hover': { background: 'transparent', opacity: 0.75 }
                      }}
                    >
                      <FormattedMessage id="view-all" defaultMessage="عرض الكل" />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
