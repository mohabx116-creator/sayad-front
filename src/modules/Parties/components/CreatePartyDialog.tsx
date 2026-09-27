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
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
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
  isActive: true,
  includeOpeningBalance: false,
  openingBalanceNature: '',
  openingBalanceDate: getToday(),
  customerOpeningBalance: { enabled: false, nature: '', date: getToday() },
  supplierOpeningBalance: { enabled: false, nature: '', date: getToday() }
});

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

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

  const partyType = form.watch('partyType');
  const isDualParty = partyType === 'both';

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

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                <FormattedMessage id="opening-balance" defaultMessage="Opening balance" />
              </Typography>
              <Controller
                name="includeOpeningBalance"
                control={form.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} disabled={isDualParty} onChange={(event) => field.onChange(event.target.checked)} />}
                    label={<FormattedMessage id="add-opening-balance" defaultMessage="Add opening balance" />}
                  />
                )}
              />
              {isDualParty && <FormHelperText><FormattedMessage id="opening-balance-dual-party-help" defaultMessage="Enter customer and supplier opening balances independently." /></FormHelperText>}

              {isDualParty && (['customerOpeningBalance', 'supplierOpeningBalance'] as const).map((side) => (
                <Box key={side} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, pt: 2 }}>
                  <Typography variant="subtitle2"><FormattedMessage id={side === 'customerOpeningBalance' ? 'customer-opening-balance' : 'supplier-opening-balance'} /></Typography>
                  <Controller name={`${side}.enabled` as const} control={form.control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label={<FormattedMessage id="add-opening-balance" />} />} />
                  {form.watch(`${side}.enabled` as const) && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mt: 1 }}>
                    <Controller name={`${side}.amount` as const} control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))} type="number" inputProps={{ min: 0.01, step: 0.01 }} label={<FormattedMessage id="opening-balance-amount" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                    <Controller name={`${side}.date` as const} control={form.control} render={({ field, fieldState }) => <TextField {...field} type="date" label={<FormattedMessage id="opening-balance-date" />} InputLabelProps={{ shrink: true }} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
                    <Controller name={`${side}.nature` as const} control={form.control} render={({ field, fieldState }) => <TextField {...field} select label={<FormattedMessage id="balance-direction" />} error={!!fieldState.error} helperText={fieldState.error?.message}><MenuItem value="Debit"><FormattedMessage id="opening-balance-debit-party" /></MenuItem><MenuItem value="Credit"><FormattedMessage id="opening-balance-credit-party" /></MenuItem></TextField>} />
                  </Box>}
                </Box>
              ))}

              {!isDualParty && form.watch('includeOpeningBalance') && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                  <Controller
                    name="openingBalanceAmount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        fullWidth
                        label={<FormattedMessage id="opening-balance-amount" defaultMessage="Amount" />}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="openingBalanceDate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type="date"
                        fullWidth
                        label={<FormattedMessage id="opening-balance-date" defaultMessage="Opening balance date" />}
                        InputLabelProps={{ shrink: true }}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        required
                      />
                    )}
                  />
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <FormattedMessage id="balance-direction" defaultMessage="Balance direction" />
                    </Typography>
                    <Controller
                      name="openingBalanceNature"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <>
                          <RadioGroup row {...field}>
                            <FormControlLabel value="Debit" control={<Radio />} label={<FormattedMessage id="opening-balance-debit-party" defaultMessage="Due to us" />} />
                            <FormControlLabel value="Credit" control={<Radio />} label={<FormattedMessage id="opening-balance-credit-party" defaultMessage="Due from us" />} />
                          </RadioGroup>
                          <FormHelperText error={!!fieldState.error}>{fieldState.error?.message || <FormattedMessage id="opening-balance-direction-help" defaultMessage="Debit: the party owes us. Credit: we owe the party." />}</FormHelperText>
                        </>
                      )}
                    />
                  </Box>
                </Box>
              )}
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
