import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { IconAlertCircle } from '@tabler/icons-react';

export interface ImportPreviewErrorListProps {
  messages?: string[] | null;
}

export default function ImportPreviewErrorList({ messages }: ImportPreviewErrorListProps) {
  const theme = useTheme();

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.5} sx={{ mt: 0.75 }}>
      {messages.map((message, index) => (
        <Box
          key={`${message}-${index}`}
          sx={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 0.5,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            p: '2px 6px',
            borderRadius: 1,
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.2)
          }}
        >
          <IconAlertCircle
            size={13}
            color={theme.palette.error.main}
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <Typography variant="caption" color="error.main" sx={{ fontWeight: 600, fontSize: '0.72rem', lineHeight: 1.3 }}>
            {message}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
