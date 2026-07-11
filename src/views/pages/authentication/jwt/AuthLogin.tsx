import { MouseEvent, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useIntl } from 'react-intl';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { getHttpErrorMessage } from 'utils/http-error';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function JWTLogin({ ...others }) {
  const { login } = useAuth();
  const intl = useIntl();
  const scriptedRef = useScriptRef();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: MouseEvent) => {
    event.preventDefault();
  };

  const getLoginErrorMessage = (error: unknown) => {
    const message = getHttpErrorMessage(error, '').toLowerCase();

    if (message.includes('network') || message.includes('services') || message.includes('failed to fetch')) {
      return intl.formatMessage({ id: 'auth-login-network-error' });
    }

    if (message.includes('invalid') || message.includes('authentication failed') || message.includes('unauthorized')) {
      return intl.formatMessage({ id: 'auth-login-invalid-credentials' });
    }

    return intl.formatMessage({ id: 'auth-login-unexpected-error' });
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email(intl.formatMessage({ id: 'auth-login-email-invalid' }))
          .max(255)
          .required(intl.formatMessage({ id: 'auth-login-email-required' })),
        password: Yup.string().required(intl.formatMessage({ id: 'auth-login-password-required' })).max(255)
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const trimmedEmail = values.email.trim();
          await login(trimmedEmail, values.password);

          if (scriptedRef.current) {
            setStatus({ success: true });
            setSubmitting(false);
          }
        } catch (err: any) {
          if (scriptedRef.current) {
            setStatus({ success: false });
            setErrors({ submit: getLoginErrorMessage(err) });
            setSubmitting(false);
          }
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit} {...others}>
          <CustomFormControl fullWidth error={Boolean(touched.email && errors.email)}>
            <InputLabel htmlFor="outlined-adornment-email-login">{intl.formatMessage({ id: 'auth-login-email-label' })}</InputLabel>
            <OutlinedInput
              id="outlined-adornment-email-login"
              type="email"
              value={values.email}
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
            />
            {touched.email && errors.email && (
              <FormHelperText error id="standard-weight-helper-text-email-login">
                {errors.email}
              </FormHelperText>
            )}
          </CustomFormControl>

          <CustomFormControl fullWidth error={Boolean(touched.password && errors.password)}>
            <InputLabel htmlFor="outlined-adornment-password-login">{intl.formatMessage({ id: 'auth-login-password-label' })}</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-login"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label={intl.formatMessage({ id: 'auth-login-password-label' })}
            />
            {touched.password && errors.password && (
              <FormHelperText error id="standard-weight-helper-text-password-login">
                {errors.password}
              </FormHelperText>
            )}
          </CustomFormControl>

          {errors.submit && (
            <Box sx={{ mt: 3 }}>
              <FormHelperText error>{errors.submit}</FormHelperText>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <AnimateButton>
              <Button color="secondary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                {isSubmitting ? intl.formatMessage({ id: 'auth-login-loading' }) : intl.formatMessage({ id: 'auth-login-submit' })}
              </Button>
            </AnimateButton>
          </Box>
        </form>
      )}
    </Formik>
  );
}
