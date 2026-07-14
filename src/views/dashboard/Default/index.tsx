// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard title="مؤسسة الصياد للتعبئة والتغليف">
          <Box
            sx={{
              display: 'inline-block',
              p: { xs: 2.5, md: 4 },
              mb: 3,
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
                : `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[200]} 100%)`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 2px 14px 0 rgba(0,0,0,0.2)'
                : '0 2px 14px 0 rgba(0,0,0,0.03)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
              transition: 'all 0.3s ease-in-out',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '4px 0 0 4px',
                opacity: 0.8
              },
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 6px 20px 0 rgba(0,0,0,0.3)'
                  : '0 6px 20px 0 rgba(0,0,0,0.08)',
                borderColor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
              },
              cursor: 'default'
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.8rem', md: '3.2rem' },
                fontWeight: 700,
                color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark',
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}
            >
              الصيـــــاد - El-Sayad
            </Typography>
          </Box>
          <Typography variant="body1">المنصة الأساسية جاهزة ومؤمنة.</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
