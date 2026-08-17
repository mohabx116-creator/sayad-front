import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import CodeNameLabel from './CodeNameLabel';
import type { TreasuryAccountListItem } from 'modules/Treasury/types/treasury.types';
import {
  DIRECT_INVOICE_PAYMENT_METHODS,
  getCompatibleTreasuryAccount,
  getCompatibleTreasuryAccounts,
  getInvoicePaymentMethodLabel
} from 'shared/utils/invoiceSettlement';

function formatSettlementAmount(locale: string, value: number, currencyCode?: string) {
  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return currencyCode ? `${formattedValue} ${currencyCode}` : formattedValue;
}

type Props = {
  open: boolean;
  title: ReactNode;
  confirmLabel: ReactNode;
  invoiceCurrencyCode: string;
  treasuryAccounts: TreasuryAccountListItem[];
  settlementAmount?: number;
  settlementCurrencyCode?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (request: { paymentMethod: 'Cash' | 'Wallet' | 'InstaPay'; treasuryAccountId: string }) => Promise<void> | void;
};

export default function InvoiceSettlementDialog({
  open,
  title,
  confirmLabel,
  invoiceCurrencyCode,
  treasuryAccounts,
  settlementAmount,
  settlementCurrencyCode,
  isSubmitting = false,
  onClose,
  onConfirm
}: Props) {
  const intl = useIntl();
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Wallet' | 'InstaPay'>('Cash');
  const [treasuryAccountId, setTreasuryAccountId] = useState('');

  const compatibleAccounts = useMemo(
    () => getCompatibleTreasuryAccounts(treasuryAccounts, paymentMethod, invoiceCurrencyCode),
    [invoiceCurrencyCode, paymentMethod, treasuryAccounts]
  );
  const selectedAccount = useMemo(
    () => compatibleAccounts.find((account) => account.id === treasuryAccountId) ?? null,
    [compatibleAccounts, treasuryAccountId]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setPaymentMethod('Cash');
    const autoSelected = getCompatibleTreasuryAccount(treasuryAccounts, 'Cash', invoiceCurrencyCode);
    setTreasuryAccountId(autoSelected?.id ?? '');
  }, [invoiceCurrencyCode, open, treasuryAccounts]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (compatibleAccounts.length === 1) {
      setTreasuryAccountId(compatibleAccounts[0].id);
      return;
    }

    if (compatibleAccounts.length > 1 && !compatibleAccounts.some((account) => account.id === treasuryAccountId)) {
      setTreasuryAccountId('');
      return;
    }

    if (compatibleAccounts.length === 0) {
      setTreasuryAccountId('');
    }
  }, [compatibleAccounts, open, treasuryAccountId]);

  const canConfirm = Boolean(treasuryAccountId) && compatibleAccounts.length > 0 && !isSubmitting;

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!treasuryAccountId || compatibleAccounts.length === 0) {
      return;
    }

    await onConfirm({ paymentMethod, treasuryAccountId });
  };

  const noAccountMessage =
    compatibleAccounts.length === 0
      ? intl.formatMessage({
          id: 'invoice-settlement.no-compatible-account',
          defaultMessage: 'No active treasury account is compatible with the selected payment method and invoice currency.'
        })
      : null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <Alert severity="info" variant="outlined">
            <FormattedMessage
              id="invoice-settlement.dialog-help"
              defaultMessage="Choose a direct payment method and a compatible active treasury account for the invoice currency."
            />
          </Alert>
          {typeof settlementAmount === 'number' && (
            <TextField
              fullWidth
              label={<FormattedMessage id="invoice-settlement.payment-amount" defaultMessage="Payment Amount" />}
              value={formatSettlementAmount(intl.locale, settlementAmount, settlementCurrencyCode)}
              InputProps={{ readOnly: true }}
              inputProps={{ dir: 'ltr' }}
              helperText={
                <FormattedMessage
                  id="invoice-settlement.payment-amount-help"
                  defaultMessage="This is the full remaining amount that will be settled now."
                />
              }
            />
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="payment-method" defaultMessage="Payment Method" />}
                value={paymentMethod}
                onChange={(event) => {
                  const nextMethod = event.target.value as 'Cash' | 'Wallet' | 'InstaPay';
                  setPaymentMethod(nextMethod);
                  const nextAutoSelected = getCompatibleTreasuryAccount(treasuryAccounts, nextMethod, invoiceCurrencyCode);
                  setTreasuryAccountId(nextAutoSelected?.id ?? '');
                }}
              >
                {DIRECT_INVOICE_PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {getInvoicePaymentMethodLabel(intl.locale, method)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              {compatibleAccounts.length === 0 ? (
                <Alert severity="warning" variant="outlined">
                  {noAccountMessage}
                </Alert>
              ) : compatibleAccounts.length === 1 ? (
                <TextField
                  fullWidth
                  label={<FormattedMessage id="treasury-account" defaultMessage="Treasury Account" />}
                  value={`${compatibleAccounts[0].code} - ${compatibleAccounts[0].nameArabic}`}
                  InputProps={{ readOnly: true }}
                  helperText={<FormattedMessage id="invoice-settlement.auto-selected-account" defaultMessage="A single compatible treasury account was selected automatically." />}
                />
              ) : (
                <Autocomplete
                  options={compatibleAccounts}
                  value={selectedAccount}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <CodeNameLabel code={option.code} nameArabic={option.nameArabic} />
                    </li>
                  )}
                  onChange={(_, newValue) => setTreasuryAccountId(newValue?.id ?? '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label={<FormattedMessage id="treasury-account" defaultMessage="Treasury Account" />}
                      helperText={<FormattedMessage id="invoice-settlement.select-compatible-account" defaultMessage="Select an active treasury account that matches the payment method and invoice currency." />}
                    />
                  )}
                />
              )}
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!canConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
