import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import {
  IconArrowLeft,
  IconAward,
  IconBuildingBank,
  IconCashBanknote,
  IconCheck,
  IconClock,
  IconDiamond,
  IconSparkles,
  IconWallet,
  IconX
} from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import type { TreasuryAccountListItem } from '../types/treasury.types';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { formatTreasuryMoney } from '../utils/treasury.format';

export type TreasuryChannelIdentity = 'cash' | 'wallet' | 'naqdi' | 'bank' | 'generic';

export function getTreasuryChannelIdentity(account: {
  nameArabic?: string | null;
  nameEnglish?: string | null;
  code?: string | null;
  accountType?: string | null;
}): TreasuryChannelIdentity {
  const arabic = (account.nameArabic ?? '').trim().toLowerCase();
  const english = (account.nameEnglish ?? '').trim().toLowerCase();
  const code = (account.code ?? '').trim().toLowerCase();
  const accountType = (account.accountType ?? '').trim().toLowerCase();

  // 1. Naqdi (نقدي / Naqdi) - exact or distinct channel identifier
  if (
    arabic === 'نقدي' ||
    arabic === 'نقدي كاش' ||
    arabic.includes('قناة نقدي') ||
    english === 'naqdi' ||
    english.includes('naqdi') ||
    code.includes('naqdi')
  ) {
    return 'naqdi';
  }

  // 2. Electronic Wallet (المحفظة الإلكترونية / Electronic Wallet)
  if (
    arabic.includes('محفظة') ||
    arabic.includes('إلكترونية') ||
    arabic.includes('الكترونية') ||
    english.includes('wallet') ||
    english.includes('electronic') ||
    accountType === 'electronicwallet' ||
    accountType === 'wallet'
  ) {
    return 'wallet';
  }

  // 3. Cash Treasury (الخزينة النقدية / Cash Treasury / الصندوق)
  if (
    arabic.includes('خزينة') ||
    arabic.includes('نقدية') ||
    arabic.includes('صندوق') ||
    english.includes('cash') ||
    english.includes('cashbox') ||
    accountType === 'cash' ||
    accountType === 'pettycash'
  ) {
    return 'cash';
  }

  // 4. Bank
  if (arabic.includes('بنك') || arabic.includes('مصرف') || english.includes('bank') || accountType === 'bank' || accountType === 'bankaccount') {
    return 'bank';
  }

  return 'generic';
}

function formatMovementDate(value: string | null, locale: string) {
  if (!value) {
    return locale.startsWith('ar') ? 'لا توجد حركات مسجلة' : 'No recorded movements';
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(parsed);
}

interface TreasuryAccountCardProps {
  account: TreasuryAccountListItem;
  onActivate?: (id: string, rowVersion: string) => void;
  onDeactivate?: (id: string, rowVersion: string) => void;
}

export default function TreasuryAccountCard({ account, onActivate, onDeactivate }: TreasuryAccountCardProps) {
  const theme = useTheme();
  const intl = useIntl();
  const isRtl = theme.direction === 'rtl';

  const identity = useMemo(() => getTreasuryChannelIdentity(account), [account]);

  // Styling configuration per identity
  const styleConfig = useMemo(() => {
    switch (identity) {
      case 'cash':
        return {
          primaryColor: '#059669',
          accentColor: '#10B981',
          lightBg: '#F0FDF4',
          subtleBg: 'rgba(16, 185, 129, 0.08)',
          borderColor: 'rgba(16, 185, 129, 0.35)',
          topBorder: 'linear-gradient(90deg, #059669 0%, #34D399 100%)',
          iconBg: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
          iconColor: '#FFFFFF',
          badgeText: intl.formatMessage({ id: 'treasury.badge-cash', defaultMessage: 'نقد سائل — كاش' }),
          badgeBg: '#DCFCE7',
          badgeColor: '#166534',
          icon: IconCashBanknote,
          tagline: intl.formatMessage({ id: 'treasury.tagline-cash', defaultMessage: 'الخزينة النقدية الرئيسية' })
        };
      case 'wallet':
        return {
          primaryColor: '#4F46E5',
          accentColor: '#6366F1',
          lightBg: '#EEF2FF',
          subtleBg: 'rgba(99, 102, 241, 0.08)',
          borderColor: 'rgba(99, 102, 241, 0.35)',
          topBorder: 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)',
          iconBg: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
          iconColor: '#FFFFFF',
          badgeText: intl.formatMessage({ id: 'treasury.badge-wallet', defaultMessage: 'محفظة رقمية — E-Wallet' }),
          badgeBg: '#E0E7FF',
          badgeColor: '#3730A3',
          icon: IconWallet,
          tagline: intl.formatMessage({ id: 'treasury.tagline-wallet', defaultMessage: 'قناة الدفع والتحصيل الإلكتروني' })
        };
      case 'naqdi':
        return {
          primaryColor: '#B45309',
          accentColor: '#D97706',
          lightBg: '#FFFBEB',
          subtleBg: 'rgba(217, 119, 6, 0.08)',
          borderColor: 'rgba(217, 119, 6, 0.38)',
          topBorder: 'linear-gradient(90deg, #92400E 0%, #F59E0B 50%, #FCD34D 100%)',
          iconBg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
          iconColor: '#FFFFFF',
          badgeText: intl.formatMessage({ id: 'treasury.badge-naqdi', defaultMessage: 'نقدي — قناة فاخرة' }),
          badgeBg: '#FEF3C7',
          badgeColor: '#92400E',
          icon: IconDiamond,
          tagline: intl.formatMessage({ id: 'treasury.tagline-naqdi', defaultMessage: 'منظومة نقدي المعتمدة' })
        };
      case 'bank':
        return {
          primaryColor: '#0369A1',
          accentColor: '#0284C7',
          lightBg: '#F0F9FF',
          subtleBg: 'rgba(2, 132, 199, 0.08)',
          borderColor: 'rgba(2, 132, 199, 0.35)',
          topBorder: 'linear-gradient(90deg, #0369A1 0%, #38BDF8 100%)',
          iconBg: 'linear-gradient(135deg, #0284C7 0%, #075985 100%)',
          iconColor: '#FFFFFF',
          badgeText: intl.formatMessage({ id: 'treasury.badge-bank', defaultMessage: 'حساب مصرفي' }),
          badgeBg: '#E0F2FE',
          badgeColor: '#075985',
          icon: IconBuildingBank,
          tagline: intl.formatMessage({ id: 'treasury.tagline-bank', defaultMessage: 'معاملات وحوالات بنكية' })
        };
      default:
        return {
          primaryColor: '#334155',
          accentColor: '#475569',
          lightBg: '#F8FAFC',
          subtleBg: 'rgba(71, 85, 105, 0.06)',
          borderColor: 'rgba(71, 85, 105, 0.25)',
          topBorder: 'linear-gradient(90deg, #475569 0%, #94A3B8 100%)',
          iconBg: 'linear-gradient(135deg, #64748B 0%, #334155 100%)',
          iconColor: '#FFFFFF',
          badgeText: account.accountTypeLabel || intl.formatMessage({ id: 'treasury.badge-generic', defaultMessage: 'خزينة مالية' }),
          badgeBg: '#F1F5F9',
          badgeColor: '#334155',
          icon: IconBuildingBank,
          tagline: intl.formatMessage({ id: 'treasury.tagline-generic', defaultMessage: 'حساب خزينة معتمد' })
        };
    }
  }, [identity, intl, account.accountTypeLabel]);

  const IconComponent = styleConfig.icon;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: styleConfig.borderColor,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(styleConfig.primaryColor, 0.15)} 100%)`
          : `linear-gradient(180deg, #FFFFFF 0%, ${styleConfig.lightBg} 100%)`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.28s ease-in-out',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${alpha(styleConfig.primaryColor, 0.15)}`,
          borderColor: styleConfig.primaryColor
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: styleConfig.topBorder
        }
      }}
    >
      <Box sx={{ p: 3, pb: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Strip: Icon, Title, Channel Badge & Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1.5 }}>
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: styleConfig.iconBg,
                color: styleConfig.iconColor,
                display: 'grid',
                placeItems: 'center',
                boxShadow: `0 6px 14px ${alpha(styleConfig.primaryColor, 0.35)}`,
                flexShrink: 0
              }}
            >
              <IconComponent size={26} stroke={1.8} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    lineHeight: 1.3
                  }}
                >
                  {account.nameArabic}
                </Typography>
                {account.code && (
                  <Chip
                    label={account.code}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: alpha(styleConfig.primaryColor, 0.1),
                      color: styleConfig.primaryColor,
                      border: '1px solid',
                      borderColor: alpha(styleConfig.primaryColor, 0.2)
                    }}
                  />
                )}
              </Box>

              {account.nameEnglish && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontWeight: 500 }}>
                  {account.nameEnglish}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Status Chip */}
          <Chip
            size="small"
            label={account.isActive ? (intl.formatMessage({ id: 'active', defaultMessage: 'نشط' })) : (intl.formatMessage({ id: 'inactive', defaultMessage: 'موقوف' }))}
            color={account.isActive ? 'success' : 'default'}
            variant={account.isActive ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 2,
              px: 0.5,
              height: 24,
              ...(account.isActive
                ? {
                    bgcolor: '#10B981',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                  }
                : {
                    borderColor: 'divider',
                    color: 'text.secondary'
                  })
            }}
          />
        </Box>

        {/* Identity Pill Badge */}
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.4,
                borderRadius: 1.5,
                bgcolor: styleConfig.badgeBg,
                color: styleConfig.badgeColor,
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              {identity === 'naqdi' && <IconSparkles size={13} stroke={2} />}
              {styleConfig.badgeText}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {styleConfig.tagline}
            </Typography>
          </Stack>
        </Box>

        {/* Major Balance Display */}
        <Box
          sx={{
            my: 'auto',
            py: 2,
            px: 2.25,
            borderRadius: 2.5,
            bgcolor: alpha(styleConfig.primaryColor, 0.05),
            border: '1px solid',
            borderColor: alpha(styleConfig.primaryColor, 0.12),
            textAlign: 'left'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: 0.5,
              color: 'text.secondary',
              display: 'block',
              mb: 0.5
            }}
          >
            <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي المتاح" />
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              component="div"
              sx={{
                fontSize: { xs: '1.85rem', sm: '2.15rem', md: '2.4rem' },
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: account.balance < 0 ? 'error.main' : styleConfig.primaryColor,
                fontFeatureSettings: '"tnum"'
              }}
            >
              {formatTreasuryMoney(account.balance, account.currencyCode)}
            </Typography>

            {account.balanceNature && (
              <Chip
                size="small"
                label={
                  account.balanceNature === 'Debit'
                    ? (intl.formatMessage({ id: 'debit', defaultMessage: 'مدين' }))
                    : account.balanceNature === 'Credit'
                      ? (intl.formatMessage({ id: 'credit', defaultMessage: 'دائن' }))
                      : (intl.formatMessage({ id: 'settled', defaultMessage: 'متزن' }))
                }
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor:
                    account.balanceNature === 'Debit'
                      ? alpha(theme.palette.warning.main, 0.12)
                      : account.balanceNature === 'Credit'
                        ? alpha(theme.palette.error.main, 0.12)
                        : alpha(theme.palette.success.main, 0.12),
                  color:
                    account.balanceNature === 'Debit'
                      ? 'warning.dark'
                      : account.balanceNature === 'Credit'
                        ? 'error.dark'
                        : 'success.dark'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Metadata info: Last Movement */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
            <IconClock size={15} stroke={1.5} />
            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              <FormattedMessage id="last-movement" defaultMessage="آخر حركة" />: {formatMovementDate(account.lastMovementDate, intl.locale)}
            </Typography>
          </Stack>

          {account.isAccountingMapped && (
            <Tooltip title={intl.formatMessage({ id: 'treasury.linked-to-gl', defaultMessage: 'مرتبط بحساب الأستاذ العام' })}>
              <Chip
                size="small"
                variant="outlined"
                label={intl.formatMessage({ id: 'treasury.gl-linked', defaultMessage: 'مربوط محاسبياً' })}
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderColor: 'divider',
                  color: 'text.secondary'
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: styleConfig.borderColor, opacity: 0.6 }} />

      {/* Card Action Footer */}
      <Box sx={{ p: 2, px: 3, bgcolor: alpha('#FFFFFF', 0.5), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Button
          component={Link}
          to={`/treasury/accounts/${account.id}`}
          variant="contained"
          size="medium"
          fullWidth
          endIcon={isRtl ? <IconArrowLeft size={17} /> : <IconArrowLeft size={17} style={{ transform: 'rotate(180deg)' }} />}
          sx={{
            borderRadius: 2.25,
            py: 1,
            fontWeight: 700,
            fontSize: '0.875rem',
            bgcolor: styleConfig.primaryColor,
            color: '#FFFFFF',
            boxShadow: `0 4px 12px ${alpha(styleConfig.primaryColor, 0.3)}`,
            '&:hover': {
              bgcolor: styleConfig.accentColor,
              boxShadow: `0 6px 16px ${alpha(styleConfig.primaryColor, 0.45)}`
            }
          }}
        >
          <FormattedMessage id="treasury.open-details" defaultMessage="فتح تفاصيل الخزينة والحركات" />
        </Button>

        {/* Quick activate / deactivate actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {account.isActive ? (
            <PermissionGuard permission={TREASURY_PERMISSIONS.accountsDeactivate}>
              <Tooltip title={intl.formatMessage({ id: 'deactivate', defaultMessage: 'إيقاف الخزينة' })}>
                <IconButton
                  size="small"
                  onClick={() => onDeactivate && onDeactivate(account.id, account.rowVersion)}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { color: 'error.main', borderColor: 'error.light', bgcolor: 'error.lighter' }
                  }}
                >
                  <IconX size={17} />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          ) : (
            <PermissionGuard permission={TREASURY_PERMISSIONS.accountsActivate}>
              <Tooltip title={intl.formatMessage({ id: 'activate', defaultMessage: 'تفعيل الخزينة' })}>
                <IconButton
                  size="small"
                  onClick={() => onActivate && onActivate(account.id, account.rowVersion)}
                  sx={{
                    color: 'success.main',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'success.light',
                    bgcolor: 'success.lighter',
                    '&:hover': { bgcolor: 'success.light', color: '#FFFFFF' }
                  }}
                >
                  <IconCheck size={17} />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          )}
        </Box>
      </Box>
    </Card>
  );
}
