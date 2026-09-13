import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

type ManufacturingComingSoonPageProps = {
  title?: string;
  subtitle?: string;
};

export default function ManufacturingComingSoonPage({
  title = 'Manufacturing Module',
  subtitle = 'This manufacturing feature is currently under active development.'
}: ManufacturingComingSoonPageProps) {
  return (
    <MainCard title={title}>
      <PageTitle>{title}</PageTitle>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" color="primary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </MainCard>
  );
}
