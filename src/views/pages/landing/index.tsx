import { Link as RouterLink } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconBuildingWarehouse, IconLock, IconNotes, IconShieldCheck, IconSparkles } from '@tabler/icons-react';

import AppBar from 'ui-component/extended/AppBar';

const featureCards = [
  {
    icon: IconBuildingWarehouse,
    title: 'Unified operations',
    text: 'Inventory, treasury, accounting, parties, and administration live in one workspace.'
  },
  {
    icon: IconShieldCheck,
    title: 'Session safety',
    text: 'JWT sessions, refresh cookies, and logout behavior stay predictable and locked down.'
  },
  {
    icon: IconNotes,
    title: 'Account shell',
    text: 'Profile, password, and appearance preferences are production-ready and easy to reach.'
  },
  {
    icon: IconLock,
    title: 'Controlled access',
    text: 'Protected routes stay behind authentication and role-aware guards.'
  }
];

export default function Landing() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, ${theme.vars.palette.primary.light} 0%, ${theme.vars.palette.background.paper} 38%, ${theme.vars.palette.grey[100]} 100%)`,
        ...theme.applyStyles('dark', {
          background: `radial-gradient(circle at top, ${theme.vars.palette.primary.dark} 0%, ${theme.vars.palette.background.default} 44%, ${theme.vars.palette.dark.main} 100%)`
        })
      }}
    >
      <AppBar />
      <Container sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Chip
                icon={<IconSparkles size={16} />}
                label="SAYAD workspace"
                sx={{ width: 'fit-content', fontWeight: 600 }}
              />
              <Stack spacing={2}>
                <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.05 }}>
                  Inventory and operations, without the demo noise.
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 720 }}>
                  SAYAD keeps the business shell focused: secure sign-in, clean account controls, practical navigation, and a landing page that
                  gets out of the way.
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/login" variant="contained" size="large">
                  Sign in
                </Button>
                <Button component={RouterLink} to="/dashboard" variant="outlined" size="large">
                  Dashboard
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                background: theme.vars.palette.background.paper,
                boxShadow: theme.shadows[8]
              }}
            >
              <Stack spacing={2}>
                <Typography variant="overline" color="text.secondary">
                  What is ready now
                </Typography>
                <Stack spacing={2}>
                  {featureCards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <Stack key={card.title} direction="row" spacing={2} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.light',
                            color: 'primary.main'
                          }}
                        >
                          <CardIcon size={22} />
                        </Box>
                        <Box>
                          <Typography variant="h6">{card.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.text}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
