// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <MainCard title="مؤسسة الصياد للتعبئة والتغليف">
          <Typography variant="h3" color={theme.palette.primary.main} gutterBottom>
            SAYAD
          </Typography>
          <Typography variant="body1">
            النظام قيد التجهيز
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}
