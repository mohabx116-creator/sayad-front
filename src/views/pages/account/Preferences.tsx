import { useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { FontFamily, I18n } from 'types/config';
import MainCard from 'ui-component/cards/MainCard';
import useConfig from 'hooks/useConfig';

const FONT_OPTIONS: Array<{ value: FontFamily; label: string }> = [
  { value: `'Cairo', 'Roboto', sans-serif`, label: 'Cairo' },
  { value: `'Roboto', sans-serif`, label: 'Roboto' },
  { value: `'Poppins', sans-serif`, label: 'Poppins' }
];

const LANGUAGE_OPTIONS: Array<{ value: I18n; label: string }> = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' }
];

export default function PreferencesPage() {
  const intl = useIntl();
  const {
    state: { i18n, fontFamily, miniDrawer, outlinedFilled, themeDirection },
    setField
  } = useConfig();

  return (
    <MainCard>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h3">{intl.formatMessage({ id: 'preferences-title' })}</Typography>
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage({ id: 'preferences-description' })}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">{intl.formatMessage({ id: 'preferences-language' })}</InputLabel>
            <Select
              labelId="language-select-label"
              label={intl.formatMessage({ id: 'preferences-language' })}
              value={i18n}
              onChange={(event) => setField('i18n', event.target.value as I18n)}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="font-family-select-label">{intl.formatMessage({ id: 'preferences-font-family' })}</InputLabel>
            <Select
              labelId="font-family-select-label"
              label={intl.formatMessage({ id: 'preferences-font-family' })}
              value={fontFamily}
              onChange={(event) => setField('fontFamily', event.target.value as FontFamily)}
            >
              {FONT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={<Switch checked={miniDrawer} onChange={(_, checked) => setField('miniDrawer', checked)} />}
            label={intl.formatMessage({ id: 'preferences-mini-drawer' })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={<Switch checked={outlinedFilled} onChange={(_, checked) => setField('outlinedFilled', checked)} />}
            label={intl.formatMessage({ id: 'preferences-filled-inputs' })}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ alignItems: 'center' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Box component="span">{intl.formatMessage({ id: 'preferences-direction-label' })}:</Box>
              <Chip size="small" label={themeDirection.toUpperCase()} />
            </Stack>
          </Alert>
        </Grid>
      </Grid>
    </MainCard>
  );
}
