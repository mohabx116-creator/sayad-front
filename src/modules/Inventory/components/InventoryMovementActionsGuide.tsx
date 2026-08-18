import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { IconHelpCircle, IconX, IconArrowDown, IconArrowUp, IconAdjustments, IconInfoCircle } from '@tabler/icons-react';

export default function InventoryMovementActionsGuide() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<IconHelpCircle size={20} />}
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: theme.palette.primary.light + '20',
          borderColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.light + '40',
            borderColor: theme.palette.primary.dark,
          },
          px: 2,
          py: 1,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Stack direction="column" alignItems="flex-start" sx={{ ml: 1, textAlign: 'left' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            <FormattedMessage id="inventory-actions-guide-cta-title" defaultMessage="💡 مش عارف تستخدم أنهي إجراء؟ اضغط هنا للشرح" />
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage id="inventory-actions-guide-cta-subtitle" defaultMessage="شرح سريع لإدخال المخزون، الصرف، والتسوية ومتى تستخدم كل واحدة." />
          </Typography>
        </Stack>
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              <FormattedMessage id="inventory-actions-guide-title" defaultMessage="دليل إجراءات حركة المخزون" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <FormattedMessage id="inventory-actions-guide-subtitle" defaultMessage="اختر الإجراء المناسب حسب سبب الحركة الفعلية للمخزون." />
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: theme.palette.grey[500] }}>
            <IconX />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
          <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
            
            {/* Stock In Card */}
            <Card sx={{ flex: 1, borderTop: `4px solid ${theme.palette.success.main}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <IconArrowDown size={24} color={theme.palette.success.main} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                    <FormattedMessage id="inventory-actions-guide-stock-in-title" defaultMessage="إدخال مخزون" />
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
                  <FormattedMessage id="inventory-actions-guide-stock-in-desc" defaultMessage="يزيد كمية وقيمة المخزون يدويًا في الحالات الاستثنائية." />
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>متى تستخدمه؟</Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0, mt: 0.5, '& li': { typography: 'caption' } }}>
                    <li><FormattedMessage id="inventory-actions-guide-stock-in-use1" defaultMessage="اكتشاف كمية موجودة فعليًا وغير مسجلة." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-stock-in-use2" defaultMessage="استلام استثنائي خارج دورة المشتريات." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-stock-in-use3" defaultMessage="تصحيح زيادة مثبتة بالمخزن." /></li>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>التأثير:</Typography>
                  <Typography variant="caption" display="block">
                    <FormattedMessage id="inventory-actions-guide-stock-in-effect" defaultMessage="يزيد رصيد الصنف وقيمة المخزون." />
                  </Typography>
                </Box>
                <Box sx={{ p: 1, backgroundColor: theme.palette.warning.light + '20', borderRadius: 1, borderLeft: `3px solid ${theme.palette.warning.main}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.warning.dark }}>
                    <FormattedMessage id="inventory-actions-guide-stock-in-warning" defaultMessage="لا تستخدمه بدل فاتورة المشتريات العادية." />
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Stock Out Card */}
            <Card sx={{ flex: 1, borderTop: `4px solid ${theme.palette.error.main}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <IconArrowUp size={24} color={theme.palette.error.main} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                    <FormattedMessage id="inventory-actions-guide-stock-out-title" defaultMessage="صرف مخزون" />
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
                  <FormattedMessage id="inventory-actions-guide-stock-out-desc" defaultMessage="يقلل كمية وقيمة المخزون يدويًا بدون فاتورة بيع." />
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>متى تستخدمه؟</Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0, mt: 0.5, '& li': { typography: 'caption' } }}>
                    <li><FormattedMessage id="inventory-actions-guide-stock-out-use1" defaultMessage="تالف أو هالك." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-stock-out-use2" defaultMessage="فاقد." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-stock-out-use3" defaultMessage="استخدام داخلي." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-stock-out-use4" defaultMessage="عينات مجانية." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-stock-out-use5" defaultMessage="استهلاك تشغيلي." /></li>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>التأثير:</Typography>
                  <Typography variant="caption" display="block">
                    <FormattedMessage id="inventory-actions-guide-stock-out-effect" defaultMessage="يقل رصيد الصنف وقيمة المخزون." />
                  </Typography>
                </Box>
                <Box sx={{ p: 1, backgroundColor: theme.palette.warning.light + '20', borderRadius: 1, borderLeft: `3px solid ${theme.palette.warning.main}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.warning.dark }}>
                    <FormattedMessage id="inventory-actions-guide-stock-out-warning" defaultMessage="لا تستخدمه بدل فاتورة المبيعات." />
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Adjustment Card */}
            <Card sx={{ flex: 1, borderTop: `4px solid ${theme.palette.info.main}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <IconAdjustments size={24} color={theme.palette.info.main} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                    <FormattedMessage id="inventory-actions-guide-adjustment-title" defaultMessage="تسوية مخزون" />
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
                  <FormattedMessage id="inventory-actions-guide-adjustment-desc" defaultMessage="تصحح الفرق بين الرصيد الفعلي بالمخزن والرصيد المسجل بالنظام." />
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>متى تستخدمه؟</Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0, mt: 0.5, '& li': { typography: 'caption' } }}>
                    <li><FormattedMessage id="inventory-actions-guide-adjustment-use1" defaultMessage="نتيجة جرد فعلي." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-adjustment-use2" defaultMessage="اكتشاف زيادة أو نقص." /></li>
                    <li><FormattedMessage id="inventory-actions-guide-adjustment-use3" defaultMessage="تصحيح فرق مخزون مثبت." /></li>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>التأثير:</Typography>
                  <Typography variant="caption" display="block">
                    <FormattedMessage id="inventory-actions-guide-adjustment-effect" defaultMessage="قد تزيد أو تقل الكمية حسب نتيجة التسوية." />
                  </Typography>
                </Box>
                <Box sx={{ p: 1, backgroundColor: theme.palette.warning.light + '20', borderRadius: 1, borderLeft: `3px solid ${theme.palette.warning.main}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.warning.dark }}>
                    <FormattedMessage id="inventory-actions-guide-adjustment-warning" defaultMessage="يجب كتابة سبب واضح للتسوية للحفاظ على سجل مراجعة مفهوم." />
                  </Typography>
                </Box>
              </CardContent>
            </Card>

          </Stack>
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.warning.light + '20', borderRadius: 2, borderLeft: `4px solid ${theme.palette.warning.main}`, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <IconInfoCircle color={theme.palette.warning.dark} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: theme.palette.warning.dark, fontWeight: 'bold', mb: 0.5 }}>
                <FormattedMessage id="inventory-actions-guide-important-title" defaultMessage="⚠️ مهم" />
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.warning.dark }}>
                <FormattedMessage id="inventory-actions-guide-important-desc" defaultMessage="العمليات الطبيعية للمخزون يجب أن تتم من خلال المشتريات والمبيعات والمرتجعات. استخدم إجراءات الحركة اليدوية فقط للحالات الاستثنائية والتصحيحات والجرد." />
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
