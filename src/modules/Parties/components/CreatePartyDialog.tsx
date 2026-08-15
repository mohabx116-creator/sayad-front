import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { createParty, deactivateParty } from '../api/partiesApi';
import { cleanCreate, PartyFormValues } from './PartyForm';
import { createPartySchema } from '../schemas/party.schema';

export interface CreatePartyDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (partyId: string) => Promise<void> | void;
  initialPartyType?: 'customer' | 'supplier' | 'both';
}

const getDefaultValues = (partyType: 'customer' | 'supplier' | 'both' = 'customer'): PartyFormValues => ({
  name: '',
  mobileNumber: '',
  address: '',
  notes: '',
  partyType,
  isActive: true
});

export default function CreatePartyDialog({
  open,
  onClose,
  onSaved,
  initialPartyType = 'customer'
}: CreatePartyDialogProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(createPartySchema) as any,
    defaultValues: getDefaultValues(initialPartyType)
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(initialPartyType));
      setIsSaving(false);
    }
  }, [open, initialPartyType, form]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleFormSubmit = async (values: PartyFormValues) => {
    try {
      setIsSaving(true);
      const party = await createParty(cleanCreate(values));
      if (!values.isActive) {
        await deactivateParty(party.id);
      }
      notify(intl.formatMessage({ id: 'parties-action-success', defaultMessage: 'تم إنشاء الطرف بنجاح' }));
      if (onSaved) {
        await onSaved(party.id);
      }
      onClose();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : intl.formatMessage({ id: 'parties-action-failed', defaultMessage: 'تعذر إنشاء الطرف' }),
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2.5
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 }
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          <FormattedMessage id="create-party" defaultMessage="إنشاء طرف" />
        </Typography>
        <IconButton
          aria-label={intl.formatMessage({ id: 'close', defaultMessage: 'إغلاق' })}
          onClick={onClose}
          disabled={isSaving}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={form.handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5
            }}
          >
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={<FormattedMessage id="party-name" defaultMessage="الاسم" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  required
                  autoFocus
                />
              )}
            />

            {/* Mobile Number */}
            <Controller
              name="mobileNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label={<FormattedMessage id="party-mobile-number" defaultMessage="رقم الجوال" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            {/* Party Type */}
            <Controller
              name="partyType"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label={<FormattedMessage id="party-type" defaultMessage="نوع الطرف" />}
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="customer">
                    <FormattedMessage id="party-customer" defaultMessage="عميل" />
                  </MenuItem>
                  <MenuItem value="supplier">
                    <FormattedMessage id="party-supplier" defaultMessage="مورد" />
                  </MenuItem>
                  <MenuItem value="both">
                    <FormattedMessage id="party-type-both" defaultMessage="عميل ومورد" />
                  </MenuItem>
                </TextField>
              )}
            />

            {/* Active Switch */}
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  sx={{
                    height: '100%',
                    alignItems: 'center',
                    px: 1,
                    m: 0
                  }}
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      <FormattedMessage id="active" defaultMessage="نشط" />
                    </Typography>
                  }
                />
              )}
            />

            {/* Address */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    label={<FormattedMessage id="party-address" defaultMessage="العنوان" />}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Notes */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    multiline
                    minRows={3}
                    label={<FormattedMessage id="party-notes" defaultMessage="ملاحظات" />}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1.5
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSaving}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            <FormattedMessage id="cancel" defaultMessage="إلغاء" />
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSaving}
            startIcon={
              isSaving ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />
            }
            sx={{ px: 3.5, fontWeight: 700 }}
          >
            <FormattedMessage id={isSaving ? 'loading' : 'save'} defaultMessage="حفظ" />
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
