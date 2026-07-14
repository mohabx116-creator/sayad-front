import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

type PartyBalanceProps = {
  balance: number;
  balanceNature: string;
};

export default function PartyBalance({ balance, balanceNature }: PartyBalanceProps) {
  if (balanceNature === 'Debit') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', fontWeight: 600 }}>
        <IconTrendingDown size={16} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
          {balance.toFixed(2)} ج.م
        </Typography>
      </Box>
    );
  }

  if (balanceNature === 'Credit') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1b5e20', fontWeight: 600 }}>
        <IconTrendingUp size={16} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
          {balance.toFixed(2)} ج.م
        </Typography>
      </Box>
    );
  }

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.5 }}>
      0.00 ج.م
    </Typography>
  );
}
