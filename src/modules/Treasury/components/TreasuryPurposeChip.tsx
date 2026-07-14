import Chip from '@mui/material/Chip';

export default function TreasuryPurposeChip({ purpose }: { purpose: string }) {
  if (!purpose) return null;
  return <Chip size="small" label={purpose} variant="outlined" color="primary" sx={{ borderRadius: 1 }} />;
}
