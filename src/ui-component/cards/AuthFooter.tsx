// material-ui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

export default function AuthFooter() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="subtitle2">SAYAD</Typography>
      <Typography variant="subtitle2">Secure operations workspace</Typography>
    </Stack>
  );
}
