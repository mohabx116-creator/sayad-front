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
  IconBuildingBank,
  IconCashBanknote,
  IconCheck,
  IconClock,
  IconSparkles,
  IconWallet,
  IconX
} from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import type { TreasuryAccountListItem } from '../types/treasury.types';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { formatTreasuryMoney } from '../utils/treasury.format';

export type TreasuryChannelIdentity = 'cash' | 'wallet' | 'instapay' | 'bank' | 'generic';

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

  // 1. InstaPay (إنستاباي / InstaPay)
  if (
    arabic === 'إنستاباي' ||
    arabic === 'انستاباي' ||
    arabic.includes('إنستاباي') ||
    arabic.includes('انستاباي') ||
    arabic.includes('إنستا باي') ||
    arabic.includes('انستا باي') ||
    english === 'instapay' ||
    english.includes('instapay') ||
    code.includes('instapay')
  ) {
    return 'instapay';
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
          icon: IconCashBanknote
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
          icon: IconWallet
        };
      case 'instapay':
        return {
          primaryColor: '#7C3AED',
          accentColor: '#8B5CF6',
          lightBg: '#FAF5FF',
          subtleBg: 'rgba(124, 58, 237, 0.08)',
          borderColor: 'rgba(124, 58, 237, 0.35)',
          topBorder: 'linear-gradient(90deg, #6D28D9 0%, #8B5CF6 50%, #EC4899 100%)',
          iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          iconColor: '#FFFFFF',
          icon: IconSparkles
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
          icon: IconBuildingBank
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
          icon: IconBuildingBank
        };
    }
  }, [identity, intl, account.accountTypeLabel]);

  const IconComponent = styleConfig.icon;
  const displayName = isRtl ? (account.nameArabic ?? account.nameEnglish ?? '') : (account.nameEnglish ?? account.nameArabic ?? '');

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
      <Box sx={{ p: { xs: 2.25, sm: 2.5 }, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.25 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.25,
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
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  lineHeight: 1.3
                }}
              >
                {displayName}
              </Typography>
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

        {/* Major Balance Display */}
        <Box
          sx={{
            my: 'auto',
            py: 1.75,
            px: 2,
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
                fontSize: { xs: '1.7rem', sm: '1.95rem', md: '2.15rem' },
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: account.balance < 0 ? 'error.main' : styleConfig.primaryColor,
                fontFeatureSettings: '"tnum"'
              }}
            >
              {formatTreasuryMoney(account.balance, account.currencyCode)}
            </Typography>
          </Box>
        </Box>

        {/* Metadata info: Last Movement */}
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
            <IconClock size={15} stroke={1.5} />
            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              <FormattedMessage id="last-movement" defaultMessage="آخر حركة" />: {formatMovementDate(account.lastMovementDate, intl.locale)}
            </Typography>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ borderColor: styleConfig.borderColor, opacity: 0.6 }} />

      {/* Card Action Footer */}
      <Box sx={{ p: { xs: 1.75, sm: 2 }, px: { xs: 2.25, sm: 3 }, bgcolor: alpha('#FFFFFF', 0.5), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25 }}>
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
