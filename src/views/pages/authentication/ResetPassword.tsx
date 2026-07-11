import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';

import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';

const loadAuthResetPassword = () => import('./jwt/AuthResetPassword');

export default function ResetPassword() {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [AuthResetPasswordComponent, setAuthResetPasswordComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    loadAuthResetPassword()
      .then((module) => setAuthResetPasswordComponent(() => module.default))
      .catch((error) => {
        console.error('Error loading AuthResetPassword', error);
      });
  }, []);

  return (
    <AuthWrapper1>
      <Stack sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Stack sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
          <Box sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
            <AuthCardWrapper>
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Link to="#" aria-label="theme logo">
                    <Logo />
                  </Link>
                </Box>
                <Stack direction={{ xs: 'column-reverse', md: 'row' }} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                      Reset Password
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '16px', textAlign: { xs: 'center', md: 'inherit' } }}>
                      Please choose your new password
                    </Typography>
                  </Stack>
                </Stack>
                {AuthResetPasswordComponent && <AuthResetPasswordComponent />}
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>
        <Box sx={{ px: 3, my: 3 }}>
          <AuthFooter />
        </Box>
      </Stack>
    </AuthWrapper1>
  );
}
