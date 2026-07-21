import Box from '@mui/material/Box';

interface CodeNameLabelProps {
  code: string;
  nameArabic: string;
}

export default function CodeNameLabel({ code, nameArabic }: CodeNameLabelProps) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, unicodeBidi: 'plaintext' }} dir="ltr">
      <Box component="span" sx={{ fontWeight: 600 }}>
        {code}
      </Box>
      <Box component="span" aria-hidden="true">
        -
      </Box>
      <Box component="span" dir="auto">
        {nameArabic}
      </Box>
    </Box>
  );
}
