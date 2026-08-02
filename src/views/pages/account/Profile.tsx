import { useState } from 'react';

import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Formik } from 'formik';

import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconCalendar, IconLock, IconMail, IconShieldCheck, IconUser } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import useAuth from 'hooks/useAuth';

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function ProfilePage() {
  const theme = useTheme();
  const intl = useIntl();
  const { user, updateProfile } = useAuth();
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const name = user?.name ?? '';
  const initials = (name || 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Stack spacing={1}>
          <Typography variant="h3">{intl.formatMessage({ id: 'account-profile-title' })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage({ id: 'account-profile-description' })}
          </Typography>
        </Stack>
      </Grid>

      {feedback && (
        <Grid size={{ xs: 12 }}>
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: theme.palette.primary.main,
                  fontSize: 28,
                  fontWeight: 700
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h4">{name || 'SAYAD User'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip size="small" label={user?.isSystemOwner ? intl.formatMessage({ id: 'system-user' }) : intl.formatMessage({ id: 'user' })} />
                <Chip size="small" color={user?.isLocked ? 'error' : 'success'} label={user?.isLocked ? intl.formatMessage({ id: 'locked' }) : intl.formatMessage({ id: 'active' })} />
                <Chip size="small" variant="outlined" label={`${user?.roles?.length ?? 0} ${intl.formatMessage({ id: 'roles' })}`} />
              </Stack>
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconMail size={18} />
                <Box>
                  <Typography variant="subtitle2">{intl.formatMessage({ id: 'email' })}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconUser size={18} />
                <Box>
                  <Typography variant="subtitle2">{intl.formatMessage({ id: 'name' })}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.name}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconShieldCheck size={18} />
                <Box>
                  <Typography variant="subtitle2">{intl.formatMessage({ id: 'status' })}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.isLocked ? intl.formatMessage({ id: 'locked' }) : intl.formatMessage({ id: 'active' })}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconCalendar size={18} />
                <Box>
                  <Typography variant="subtitle2">{intl.formatMessage({ id: 'created-date' })}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(user?.createdAtUtc)}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconLock size={18} />
                <Box>
                  <Typography variant="subtitle2">{intl.formatMessage({ id: 'last-login' })}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(user?.lastLoginAtUtc)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard>
          <Formik
            enableReinitialize
            initialValues={{ displayName: name }}
            validationSchema={Yup.object().shape({
              displayName: Yup.string().trim().max(200, intl.formatMessage({ id: 'create-user-display-name-too-long' })).required(intl.formatMessage({ id: 'create-user-display-name-required' }))
            })}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                await updateProfile(values.displayName.trim());
                setFeedback({
                  severity: 'success',
                  message: intl.formatMessage({ id: 'profile-updated-success' })
                });
              } catch (error: any) {
                setErrors({ displayName: error?.message ?? intl.formatMessage({ id: 'profile-update-failed' }) });
                setFeedback({
                  severity: 'error',
                  message: error?.message ?? intl.formatMessage({ id: 'profile-update-failed' })
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h4">{intl.formatMessage({ id: 'account-profile-summary' })}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: 'account-profile-summary-description' })}
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    name="displayName"
                    label={intl.formatMessage({ id: 'display-name' })}
                    value={values.displayName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    error={Boolean(touched.displayName && errors.displayName)}
                    helperText={touched.displayName && errors.displayName ? errors.displayName : ' '}
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label={intl.formatMessage({ id: 'email' })} value={user?.email ?? ''} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label={intl.formatMessage({ id: 'status' })}
                        value={user?.isLocked ? intl.formatMessage({ id: 'locked' }) : intl.formatMessage({ id: 'active' })}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {intl.formatMessage({ id: 'save' })}
                    </Button>
                  </Stack>
                  {errors.displayName && <FormHelperText error>{errors.displayName}</FormHelperText>}
                </Stack>
              </form>
            )}
          </Formik>
        </MainCard>
      </Grid>
    </Grid>
  );
}
