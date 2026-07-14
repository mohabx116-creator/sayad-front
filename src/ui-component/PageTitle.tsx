import { Typography, Stack, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import useConfig from 'hooks/useConfig';
import { FormattedMessage } from 'react-intl';
import { ThemeDirection } from 'config';
import { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  sx?: any;
}

export default function PageTitle({ children, sx }: PageTitleProps) {
  const navigate = useNavigate();
  const { state: { themeDirection } } = useConfig();

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={sx}>
      <Button
        variant="outlined"
        size="small"
        color="secondary"
        onClick={() => navigate(-1)}
        startIcon={themeDirection === ThemeDirection.RTL ? <IconArrowRight size={18} /> : <IconArrowLeft size={18} />}
        sx={{ mr: 1, minWidth: 'auto', px: 2 }}
      >
        <FormattedMessage id="back" defaultMessage="رجوع" />
      </Button>
      <Typography variant="h2" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
    </Stack>
  );
}
