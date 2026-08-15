import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { IconAlertTriangle, IconCircleCheck, IconTable } from '@tabler/icons-react';

export interface ImportPreviewSummaryProps {
  totalRows: number;
  validRows: number;
  failedRows: number;
}

export default function ImportPreviewSummary({
  totalRows,
  validRows,
  failedRows
}: ImportPreviewSummaryProps) {
  const theme = useTheme();

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              flexShrink: 0
            }}
          >
            <IconTable size={24} stroke={1.75} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              إجمالي الصفوف
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totalRows}
            </Typography>
          </Box>
        </Card>

        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.04),
            borderColor: alpha(theme.palette.success.main, 0.3),
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.success.main, 0.15),
              color: theme.palette.success.main,
              flexShrink: 0
            }}
          >
            <IconCircleCheck size={24} stroke={1.75} />
          </Box>
          <Box>
            <Typography variant="caption" color="success.dark" sx={{ fontWeight: 500 }}>
              صفوف سليمة
            </Typography>
            <Typography variant="h4" color="success.dark" sx={{ fontWeight: 700 }}>
              {validRows}
            </Typography>
          </Box>
        </Card>

        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: failedRows > 0 ? alpha(theme.palette.error.main, 0.04) : 'background.paper',
            borderColor: failedRows > 0 ? alpha(theme.palette.error.main, 0.3) : 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: failedRows > 0 ? alpha(theme.palette.error.main, 0.15) : 'grey.100',
              color: failedRows > 0 ? theme.palette.error.main : 'text.disabled',
              flexShrink: 0
            }}
          >
            <IconAlertTriangle size={24} stroke={1.75} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              color={failedRows > 0 ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: 500 }}
            >
              صفوف بها أخطاء
            </Typography>
            <Typography
              variant="h4"
              color={failedRows > 0 ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: 700 }}
            >
              {failedRows}
            </Typography>
          </Box>
        </Card>
      </Box>

      {failedRows > 0 ? (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          توجد أخطاء في <strong>{failedRows}</strong> صف. لا يمكن تأكيد الاستيراد حتى يتم تصحيح كافة الأخطاء في الملف وإعادة رفعه.
        </Alert>
      ) : (
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          تم فحص كافة الصفوف بنجاح (<strong>{validRows}</strong> صف سليم). يمكنك الآن مراجعة الجدول والضغط على &quot;تأكيد الاستيراد&quot; لإتمام العملية.
        </Alert>
      )}
    </Stack>
  );
}
