import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { IconAlertTriangle, IconCheck, IconEye, IconFileUpload, IconSparkles } from '@tabler/icons-react';

export type ImportStep = 1 | 2 | 3 | 4;

export interface ImportStepIndicatorProps {
  currentStep: ImportStep;
  hasErrors?: boolean;
  isSuccess?: boolean;
}

const STEPS = [
  { step: 1, title: 'اختيار الملف', icon: IconFileUpload },
  { step: 2, title: 'معاينة البيانات', icon: IconEye },
  { step: 3, title: 'مراجعة الأخطاء', icon: IconAlertTriangle },
  { step: 4, title: 'تأكيد الاستيراد', icon: IconCheck }
] as const;

export default function ImportStepIndicator({ currentStep, hasErrors = false, isSuccess = false }: ImportStepIndicatorProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.primary.light, 0.2)
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          position: 'relative',
          gap: { xs: 0.5, sm: 1.5 },
          overflowX: 'auto',
          py: 0.5
        }}
      >
        {STEPS.map((item, index) => {
          const isCurrent = currentStep === item.step;
          const isCompleted = isSuccess ? true : currentStep > item.step;
          const isErrorStep = item.step === 3 && hasErrors && (isCurrent || currentStep > item.step);

          let circleBg = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'grey.200';
          let circleColor = 'text.secondary';
          let textColor = 'text.secondary';
          let borderColor = 'transparent';

          if (isErrorStep) {
            circleBg = alpha(theme.palette.error.main, 0.15);
            circleColor = theme.palette.error.main;
            textColor = theme.palette.error.main;
            borderColor = theme.palette.error.main;
          } else if (isCompleted) {
            circleBg = theme.palette.success.main;
            circleColor = '#ffffff';
            textColor = theme.palette.text.primary;
          } else if (isCurrent) {
            circleBg = theme.palette.primary.main;
            circleColor = '#ffffff';
            textColor = theme.palette.primary.main;
            borderColor = alpha(theme.palette.primary.main, 0.3);
          }

          const IconComponent = isCompleted && !isErrorStep ? IconCheck : item.icon;

          return (
            <Stack
              key={item.step}
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.75, sm: 1.25 }}
              sx={{
                flex: 1,
                minWidth: { xs: 'auto', sm: 120 },
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: circleBg,
                  color: circleColor,
                  border: isCurrent || isErrorStep ? `2px solid ${borderColor}` : 'none',
                  boxShadow: isCurrent ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
                  transition: 'all 0.2s ease-in-out',
                  flexShrink: 0
                }}
              >
                <IconComponent size={18} stroke={2} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    fontWeight: 500,
                    lineHeight: 1
                  }}
                >
                  الخطوة {item.step}
                </Typography>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: isCurrent ? 700 : 500,
                    color: textColor,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                    lineHeight: 1.4
                  }}
                >
                  {item.title}
                </Typography>
              </Box>

              {index < STEPS.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: isCompleted ? 'success.main' : 'divider',
                    display: { xs: 'none', md: 'block' },
                    mx: 1,
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
