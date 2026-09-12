import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { IconCircleCheck } from '@tabler/icons-react';

export interface ImportSuccessStateProps {
  totalRows: number;
  importedRows: number;
  failedRows?: number;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function ImportSuccessState({
  totalRows,
  importedRows,
  failedRows = 0,
  onClose,
  title = 'تم استيراد البيانات بنجاح!',
  subtitle = 'تمت معالجة وإضافة السجلات إلى قاعدة البيانات بنجاح.'
}: ImportSuccessStateProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.success.main, 0.15),
            color: theme.palette.success.main,
            boxShadow: `0 0 0 8px ${alpha(theme.palette.success.main, 0.08)}`
          }}
        >
          <IconCircleCheck size={44} stroke={2} />
        </Box>

        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: failedRows > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' },
            gap: 2,
            width: '100%',
            maxWidth: 600
          }}
        >
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              borderColor: 'divider'
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              إجمالي الصفوف
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {totalRows}
            </Typography>
          </Card>

          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.08),
              borderColor: alpha(theme.palette.success.main, 0.3)
            }}
          >
            <Typography variant="caption" color="success.dark" sx={{ fontWeight: 500 }}>
              عدد الصفوف المستوردة
            </Typography>
            <Typography variant="h4" color="success.dark" sx={{ fontWeight: 700, mt: 0.5 }}>
              {importedRows}
            </Typography>
          </Card>

          {failedRows > 0 && (
            <Card
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.08),
                borderColor: alpha(theme.palette.error.main, 0.3)
              }}
            >
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                عدد الصفوف التي فشلت
              </Typography>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 700, mt: 0.5 }}>
                {failedRows}
              </Typography>
            </Card>
          )}
        </Box>

        <Box sx={{ pt: 1 }}>
          <Button variant="contained" color="primary" size="large" onClick={onClose} sx={{ minWidth: 160, px: 4 }}>
            إتمام وإغلاق
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
