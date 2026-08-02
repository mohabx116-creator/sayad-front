import { useState, MouseEvent } from 'react';

import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Formik } from 'formik';

import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { IconEye, IconEyeOff } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import useAuth from 'hooks/useAuth';

export default function ChangePasswordPage() {
  const intl = useIntl();
  const { changePassword } = useAuth();
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <MainCard>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h3">{intl.formatMessage({ id: 'change-password-title' })}</Typography>
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage({ id: 'change-password-description' })}
        </Typography>
      </Stack>

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 3 }} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }}
        validationSchema={Yup.object().shape({
          currentPassword: Yup.string().required(intl.formatMessage({ id: 'current-password-required' })),
          newPassword: Yup.string().required(intl.formatMessage({ id: 'auth-login-password-required' })).test(
            'strong-password',
            intl.formatMessage({ id: 'create-user-weak-password' }),
            (value) =>
              Boolean(value) &&
              value.length >= 10 &&
              /[A-Z]/.test(value) &&
              /[a-z]/.test(value) &&
              /[0-9]/.test(value) &&
              /[^a-zA-Z0-9]/.test(value)
          ),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], intl.formatMessage({ id: 'create-user-password-mismatch' }))
            .required(intl.formatMessage({ id: 'confirm-password-required' }))
        })}
        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
          try {
            await changePassword(values.currentPassword, values.newPassword, values.confirmPassword);
            resetForm();
            setFeedback({
              severity: 'success',
              message: intl.formatMessage({ id: 'password-updated-success' })
            });
          } catch (error: any) {
            const message = error?.message ?? intl.formatMessage({ id: 'password-update-failed' });
            setErrors({ currentPassword: message });
            setFeedback({
              severity: 'error',
              message
            });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                name="currentPassword"
                label={intl.formatMessage({ id: 'current-password' })}
                type={showCurrent ? 'text' : 'password'}
                value={values.currentPassword}
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.currentPassword && errors.currentPassword)}
                helperText={touched.currentPassword && errors.currentPassword ? errors.currentPassword : ' '}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrent((prev) => !prev)} onMouseDown={(event: MouseEvent) => event.preventDefault()} edge="end">
                        {showCurrent ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                name="newPassword"
                label={intl.formatMessage({ id: 'new-password' })}
                type={showNew ? 'text' : 'password'}
                value={values.newPassword}
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.newPassword && errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword ? errors.newPassword : ' '}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew((prev) => !prev)} onMouseDown={(event: MouseEvent) => event.preventDefault()} edge="end">
                        {showNew ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                name="confirmPassword"
                label={intl.formatMessage({ id: 'confirm-password' })}
                type={showConfirm ? 'text' : 'password'}
                value={values.confirmPassword}
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ' '}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((prev) => !prev)} onMouseDown={(event: MouseEvent) => event.preventDefault()} edge="end">
                        {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {intl.formatMessage({ id: 'change-password-submit' })}
                </Button>
              </Stack>
              {errors.currentPassword && !touched.currentPassword && <FormHelperText error>{errors.currentPassword}</FormHelperText>}
            </Stack>
          </form>
        )}
      </Formik>
    </MainCard>
  );
}
