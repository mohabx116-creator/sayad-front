import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconBuildingWarehouse,
  IconClock,
  IconFileInvoice,
  IconInfoCircle,
  IconReceiptTax,
  IconScale,
  IconTruckDelivery,
  IconUsers
} from '@tabler/icons-react';

import { useCustomerReceivablesAgingReport, useSupplierPayablesAgingReport } from 'modules/Accounting/hooks/useAccountingReports';
import { formatTreasuryMoney } from '../utils/treasury.format';

interface TreasuryDeferredSectionProps {
  defaultCurrencyCode?: string;
}

export default function TreasuryDeferredSection({ defaultCurrencyCode = 'EGP' }: TreasuryDeferredSectionProps) {
  const theme = useTheme();
  const intl = useIntl();
  const isRtl = theme.direction === 'rtl';

  // Sourced from live accounting aging reports
  const customerAging = useCustomerReceivablesAgingReport({ page: 1, pageSize: 1 });
  const supplierAging = useSupplierPayablesAgingReport({ page: 1, pageSize: 1 });

  const customerReceivables = customerAging.report?.netReceivable ?? 0;
  const customerInvoicesCount = customerAging.report?.invoiceCount ?? 0;
  const customerCount = customerAging.report?.customerCount ?? 0;

  const supplierPayables = supplierAging.report?.netSupplierPayable ?? 0;
  const supplierInvoicesCount = supplierAging.report?.invoiceCount ?? 0;
  const supplierCount = supplierAging.report?.supplierCount ?? 0;

  const isLoading = customerAging.isLoading || supplierAging.isLoading;

  return (
    <Box sx={{ mt: 5, mb: 4 }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <IconScale size={20} stroke={2} />
            </Box>
            <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
              <FormattedMessage id="treasury.deferred-section-title" defaultMessage="الذمم والمستحقات" />
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, mt: 0.5 }}>
            <FormattedMessage
              id="treasury.deferred-section-desc"
              defaultMessage="الأرصدة الآجلة المفتوحة للعملاء والموردين. هذه المبالغ تمثل التزامات ومستحقات محاسبية ولا تخلط مع رصيد السيولة النقدية المتاحة في الخزائن."
            />
          </Typography>
        </Box>

        {/* Informational Accounting Separation Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            border: '1px solid',
            borderColor: alpha(theme.palette.info.main, 0.25),
            color: 'info.dark'
          }}
        >
          <IconInfoCircle size={18} stroke={2} />
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.78rem' }}>
            <FormattedMessage id="treasury.deferred-note" defaultMessage="منفصلة عن أرصدة الخزائن النقدية" />
          </Typography>
        </Box>
      </Box>

      {/* Deferred Balances Cards Grid */}
      <Grid container spacing={3}>
        {/* Customer Receivables (مستحقات العملاء) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              p: 3,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: alpha('#0284C7', 0.3),
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha('#0284C7', 0.12)} 100%)`
                : 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
              boxShadow: '0 4px 18px rgba(2, 132, 199, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 24px rgba(2, 132, 199, 0.12)',
                borderColor: '#0284C7'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)'
              }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2.5,
                      bgcolor: '#E0F2FE',
                      color: '#0369A1',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)'
                    }}
                  >
                    <IconUsers size={24} stroke={2} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                      <FormattedMessage id="customer-receivables-title" defaultMessage="مستحقات العملاء" />
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      <FormattedMessage id="customer-receivables-desc" defaultMessage="مبالغ مستحقة على العملاء قيد التحصيل" />
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  size="small"
                  label={intl.formatMessage({ id: 'receivable', defaultMessage: 'مديونية عملاء' })}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: '#E0F2FE',
                    color: '#075985',
                    border: '1px solid #BAE6FD'
                  }}
                />
              </Box>

              {/* Amount Display */}
              <Box
                sx={{
                  my: 2.5,
                  p: 2.25,
                  borderRadius: 2.5,
                  bgcolor: alpha('#0284C7', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#0284C7', 0.12)
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                  <FormattedMessage id="total-receivables" defaultMessage="إجمالي الذمم المدينة المفتوحة" />
                </Typography>
                {isLoading ? (
                  <Skeleton width={180} height={45} />
                ) : (
                  <Typography
                    sx={{
                      fontSize: { xs: '1.85rem', sm: '2.2rem' },
                      fontWeight: 900,
                      color: '#0369A1',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15
                    }}
                  >
                    {formatTreasuryMoney(customerReceivables, defaultCurrencyCode)}
                  </Typography>
                )}
              </Box>

              {/* Sub metrics */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                  <IconFileInvoice size={16} stroke={1.8} />
                  <Typography variant="caption" fontWeight={600}>
                    {isLoading ? <Skeleton width={60} /> : `${customerInvoicesCount} ${intl.formatMessage({ id: 'invoices', defaultMessage: 'فاتورة مفتوحة' })}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                  <IconUsers size={16} stroke={1.8} />
                  <Typography variant="caption" fontWeight={600}>
                    {isLoading ? <Skeleton width={60} /> : `${customerCount} ${intl.formatMessage({ id: 'customers', defaultMessage: 'عميل' })}`}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Action */}
            <Button
              component={Link}
              to="/accounting/reports/customer-receivables-aging"
              variant="outlined"
              size="medium"
              fullWidth
              endIcon={isRtl ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
              sx={{
                borderRadius: 2.25,
                fontWeight: 700,
                borderColor: '#0284C7',
                color: '#0284C7',
                '&:hover': {
                  bgcolor: '#E0F2FE',
                  borderColor: '#0369A1'
                }
              }}
            >
              <FormattedMessage id="view-customer-receivables-aging" defaultMessage="عرض تقرير أعمار ذمم العملاء" />
            </Button>
          </Card>
        </Grid>

        {/* Supplier Payables (مستحقات الموردين) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              p: 3,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: alpha('#D97706', 0.35),
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha('#D97706', 0.12)} 100%)`
                : 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
              boxShadow: '0 4px 18px rgba(217, 119, 6, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.25s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 24px rgba(217, 119, 6, 0.12)',
                borderColor: '#D97706'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #D97706 0%, #FBBF24 100%)'
              }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2.5,
                      bgcolor: '#FEF3C7',
                      color: '#B45309',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)'
                    }}
                  >
                    <IconTruckDelivery size={24} stroke={2} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                      <FormattedMessage id="supplier-payables-title" defaultMessage="مستحقات الموردين" />
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      <FormattedMessage id="supplier-payables-desc" defaultMessage="مبالغ مستحقة للموردين قيد السداد" />
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  size="small"
                  label={intl.formatMessage({ id: 'payable', defaultMessage: 'التزامات موردين' })}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A'
                  }}
                />
              </Box>

              {/* Amount Display */}
              <Box
                sx={{
                  my: 2.5,
                  p: 2.25,
                  borderRadius: 2.5,
                  bgcolor: alpha('#D97706', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#D97706', 0.12)
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                  <FormattedMessage id="total-payables" defaultMessage="إجمالي الذمم الدائنة المفتوحة" />
                </Typography>
                {isLoading ? (
                  <Skeleton width={180} height={45} />
                ) : (
                  <Typography
                    sx={{
                      fontSize: { xs: '1.85rem', sm: '2.2rem' },
                      fontWeight: 900,
                      color: '#B45309',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15
                    }}
                  >
                    {formatTreasuryMoney(supplierPayables, defaultCurrencyCode)}
                  </Typography>
                )}
              </Box>

              {/* Sub metrics */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                  <IconFileInvoice size={16} stroke={1.8} />
                  <Typography variant="caption" fontWeight={600}>
                    {isLoading ? <Skeleton width={60} /> : `${supplierInvoicesCount} ${intl.formatMessage({ id: 'invoices', defaultMessage: 'فاتورة غير مسددة' })}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                  <IconBuildingWarehouse size={16} stroke={1.8} />
                  <Typography variant="caption" fontWeight={600}>
                    {isLoading ? <Skeleton width={60} /> : `${supplierCount} ${intl.formatMessage({ id: 'suppliers', defaultMessage: 'مورد' })}`}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Action */}
            <Button
              component={Link}
              to="/accounting/reports/supplier-payables-aging"
              variant="outlined"
              size="medium"
              fullWidth
              endIcon={isRtl ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
              sx={{
                borderRadius: 2.25,
                fontWeight: 700,
                borderColor: '#D97706',
                color: '#B45309',
                '&:hover': {
                  bgcolor: '#FEF3C7',
                  borderColor: '#92400E'
                }
              }}
            >
              <FormattedMessage id="view-supplier-payables-aging" defaultMessage="عرض تقرير أعمار ذمم الموردين" />
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
