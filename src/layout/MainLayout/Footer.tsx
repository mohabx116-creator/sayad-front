import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', pt: 3, mt: 'auto', pb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
        © {year} SAYAD
      </Typography>
    </Stack>
  );
}
