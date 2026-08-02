import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type ErrorStateProps = {
  status: string;
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
};

export default function ErrorState({ status, title, description, actionLabel, actionTo }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary">
            {status}
          </Typography>
          <Typography variant="h2">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => navigate(actionTo)}>
              {actionLabel}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
