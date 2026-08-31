import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconAdjustments, IconCalendarStats, IconPalette, IconSettings, IconShieldLock } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

type SettingsLinkCard = {
  titleId: string;
  descriptionId: string;
  to: string;
  icon: typeof IconSettings;
  chipLabelId?: string;
};

const settingsCards: SettingsLinkCard[] = [
  {
    titleId: 'preferences-title',
    descriptionId: 'preferences-description',
    to: '/account/preferences',
    icon: IconPalette,
    chipLabelId: 'account'
  },
  {
    titleId: 'accounting-settings',
    descriptionId: 'accounting-settings-description',
    to: '/accounting/settings',
    icon: IconAdjustments,
    chipLabelId: 'accounting'
  },
  {
    titleId: 'accounting-periods',
    descriptionId: 'accounting-periods-entry-description',
    to: '/accounting/periods',
    icon: IconCalendarStats,
    chipLabelId: 'accounting'
  },
  {
    titleId: 'system-administration',
    descriptionId: 'settings-system-description',
    to: '/system',
    icon: IconShieldLock,
    chipLabelId: 'system'
  }
];

export default function SettingsHomePage() {
  const intl = useIntl();

  return (
    <Box>
      <Breadcrumbs custom heading="settings" links={[{ title: 'settings' }]} />

      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<IconSettings size={16} />}
            label={intl.formatMessage({ id: 'settings-overview' })}
            color="primary"
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage
              id="settings-description"
              defaultMessage="Central links to configuration areas that are already managed elsewhere in Sayad."
            />
          </Typography>
        </Stack>
        <Typography variant="h3" fontWeight={700}>
          <FormattedMessage id="settings" defaultMessage="Settings" />
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        {settingsCards.map((card) => {
          const Icon = card.icon;

          return (
            <Grid key={card.to} item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,249,252,0.98) 100%)'
                }}
              >
                <CardContent sx={{ height: '100%' }}>
                  <Stack spacing={2} sx={{ height: '100%' }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={24} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                          <FormattedMessage id={card.titleId} />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id={card.descriptionId} />
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mt: 'auto', pt: 1 }}>
                      <Chip size="small" label={intl.formatMessage({ id: card.chipLabelId ?? 'settings-overview' })} variant="outlined" />
                      <Button component={Link} to={card.to} variant="contained">
                        <FormattedMessage id="settings-open" defaultMessage="Open" />
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
