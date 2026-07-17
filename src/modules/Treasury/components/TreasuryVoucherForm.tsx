import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconCalculator, IconNotes } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import type { AccountingAccountListItemDto } from 'modules/Accounting/types/accounting.types';
import type { PartyDto } from 'modules/Parties/types/parties.types';
import CodeNameLabel from 'shared/components/CodeNameLabel';

import type { TreasuryAccountListItem, TreasuryLookupOption } from '../types/treasury.types';
import { TREASURY_DOCUMENT_STATUS } from '../utils/treasury.constants';

export interface VoucherFormState {
  treasuryAccountId: string;
  partyId: string;
  voucherDate: string;
  paymentMethod: string;
  relatedDocumentNumber: string;
  reason: string;
  notes: string;
  offsetAccountingAccountId: string;
  totalAmount: number;
}

interface Props {
  type: 'receipt' | 'payment';
  isEdit: boolean;
  isLoading: boolean;
  isSaving: boolean;
  status?: string;
  voucherNumber?: string;
  form: VoucherFormState;
  setForm: React.Dispatch<React.SetStateAction<VoucherFormState>>;
  accounts: TreasuryAccountListItem[];
  parties: PartyDto[];
  offsetAccounts?: AccountingAccountListItemDto[];
  paymentMethods: TreasuryLookupOption[];
  purposes: string[];
  allocationsElement: React.ReactNode;
  allocationsTitle?: React.ReactNode;
  totalAllocated: number;
  postPermission: string;
  lookupError?: string | null;
  onRetryLookups?: () => void;
  onSubmit: (actionType: 'draft' | 'post') => void;
  backUrl: string;
}

export default function TreasuryVoucherForm({
  type,
  isEdit,
  isLoading,
  isSaving,
  status,
  voucherNumber,
  form,
  setForm,
  accounts,
  parties,
  offsetAccounts,
  paymentMethods,
  purposes,
  allocationsElement,
  allocationsTitle,
  totalAllocated,
  postPermission,
  lookupError,
  onRetryLookups,
  onSubmit,
  backUrl
}: Props) {
  const selectedAccount = accounts.find((account) => account.id === form.treasuryAccountId) ?? null;
  const selectedParty = parties.find((party) => party.id === form.partyId) ?? null;
  const selectedOffsetAccount = offsetAccounts?.find((account) => account.id === form.offsetAccountingAccountId) ?? null;
  const currentBalance = selectedAccount?.balance ?? 0;
  const totalAmount = Number(form.totalAmount) || 0;
  const resultingBalance = type === 'receipt' ? currentBalance + totalAmount : currentBalance - totalAmount;
  const isNegativeBalance = type === 'payment' && resultingBalance < 0;
  const isOverAllocated = totalAllocated > totalAmount;
  const paymentMethodSelected = Boolean(form.paymentMethod);

  if (isEdit && isLoading) {
    return <Loader />;
  }

  const titleId = isEdit ? (type === 'receipt' ? 'edit-receipt' : 'edit-payment') : (type === 'receipt' ? 'create-receipt' : 'create-payment');
  const actionLabelId = type === 'receipt' ? 'post-receipt' : 'post-payment';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          heading={titleId}
          links={[{ title: 'treasury', to: '/treasury' }, { title: type === 'receipt' ? 'receipts' : 'payments', to: backUrl }, { title: titleId }]}
          sx={{ mb: 0 }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {lookupError && (
            <Alert
              severity="error"
              action={
                onRetryLookups ? (
                  <Button color="inherit" size="small" onClick={onRetryLookups}>
                    <FormattedMessage id="retry" defaultMessage="إعادة المحاولة" />
                  </Button>
                ) : null
              }
              sx={{ mb: 3 }}
            >
              <FormattedMessage id="treasury.lookup-load-error" defaultMessage="تعذر تحميل البيانات" />
            </Alert>
          )}
          <MainCard
            content={false}
            sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0px 2px 4px rgba(0,0,0,0.03)', borderRadius: 3, mb: 3 }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--mui-palette-primary-main)', fontSize: 24 }}>payments</span>
                <Typography variant="h4" fontWeight={600} color="text.primary">
                  <FormattedMessage id={titleId} />
                  {voucherNumber && <span style={{ marginLeft: 8, fontSize: '0.85em', color: 'var(--mui-palette-text-secondary)' }}>({voucherNumber})</span>}
                </Typography>
                {status && (
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ lineHeight: 1 }}>
                      <FormattedMessage id={`treasury.status.${status.toLowerCase()}`} />
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedAccount && (
                <Box sx={{ px: 2, py: 0.75, bgcolor: 'primary.light', color: 'primary.dark', borderRadius: 1.5, border: '1px solid', borderColor: 'primary.200', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance</span>
                  <Typography variant="body2" fontWeight={600}>
                    <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />: {currentBalance.toLocaleString()} {selectedAccount.currencyCode || ''}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={accounts.filter((account) => account.isActive || account.id === form.treasuryAccountId)}
                    value={selectedAccount}
                    noOptionsText={<FormattedMessage id="treasury.no-active-accounts" defaultMessage="لا توجد بيانات متاحة" />}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => `${option.code} — ${option.nameArabic}`}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <CodeNameLabel code={option.code} nameArabic={option.nameArabic} />
                      </li>
                    )}
                    onChange={(_, newValue) => setForm((current) => ({ ...current, treasuryAccountId: newValue?.id ?? '' }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={parties}
                    value={selectedParty}
                    noOptionsText={<FormattedMessage id="treasury.no-parties" defaultMessage="لا توجد بيانات متاحة" />}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => `${option.code} — ${option.nameArabic}`}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <CodeNameLabel code={option.code} nameArabic={option.nameArabic} />
                      </li>
                    )}
                    onChange={(_, newValue) => setForm((current) => ({ ...current, partyId: newValue?.id ?? '' }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label={<FormattedMessage id="party" />}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                {type === 'receipt' && selectedParty?.isCustomer && (
                  <Grid item xs={12}>
                    <Alert severity="info" variant="outlined">
                      <FormattedMessage
                        id="treasury.receipt-customer-helper"
                        defaultMessage="سيتم الترحيل على حساب العملاء المحدد في إعدادات المحاسبة."
                      />
                    </Alert>
                  </Grid>
                )}
                {type === 'receipt' && selectedParty && !selectedParty.isCustomer && (
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={offsetAccounts ?? []}
                      value={selectedOffsetAccount}
                      noOptionsText={<FormattedMessage id="treasury.no-offset-accounts" defaultMessage="لا توجد حسابات ترحيل متاحة" />}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      getOptionLabel={(option) => `${option.code} — ${option.nameArabic}`}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <CodeNameLabel code={option.code} nameArabic={option.nameArabic} />
                        </li>
                      )}
                      onChange={(_, newValue) => setForm((current) => ({ ...current, offsetAccountingAccountId: newValue?.id ?? '' }))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label={<FormattedMessage id="offset-account" defaultMessage="الحساب المحاسبي المقابل" />}
                          helperText={<FormattedMessage id="treasury.receipt-offset-helper" defaultMessage="الحساب يجب أن يكون نشطًا وقابلًا للترحيل، ولن يظهر حساب الخزنة نفسه." />}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label={<FormattedMessage id="payment-method" defaultMessage={type === 'receipt' ? 'طريقة التحصيل' : 'طريقة الدفع'} />}
                    value={form.paymentMethod}
                    onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                  >
                    <MenuItem value="">
                      <FormattedMessage id="select" defaultMessage="اختر" />
                    </MenuItem>
                    {paymentMethods.length === 0 ? (
                      <MenuItem value="" disabled>
                        <FormattedMessage id="treasury.no-payment-methods" defaultMessage="لا توجد بيانات متاحة" />
                      </MenuItem>
                    ) : (
                      paymentMethods.map((method) => (
                        <MenuItem key={method.id} value={method.value}>
                          {method.displayName}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label={<FormattedMessage id="reason" />}
                    value={form.reason}
                    onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                  >
                    {purposes.map((purpose) => (
                      <MenuItem key={purpose} value={purpose}>
                        {purpose}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    required
                    fullWidth
                    label={<FormattedMessage id="date" />}
                    value={form.voucherDate}
                    onChange={(event) => setForm((current) => ({ ...current, voucherDate: event.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="reference-number" defaultMessage="رقم المرجع" />}
                    value={form.relatedDocumentNumber}
                    onChange={(event) => setForm((current) => ({ ...current, relatedDocumentNumber: event.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </MainCard>

          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }} content={false}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <IconNotes color="var(--mui-palette-primary-main)" size={24} />
                <Typography variant="h4" fontWeight={600}>
                  {allocationsTitle ?? <FormattedMessage id="invoice-allocations" defaultMessage="الفواتير المسددة" />}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>{allocationsElement}</Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label={<FormattedMessage id="notes" defaultMessage="الملاحظات" />}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2, position: { md: 'sticky' }, top: { md: 24 } }} content={false}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <IconCalculator color="var(--mui-palette-primary-main)" size={24} />
                <Typography variant="h4" fontWeight={600}>
                  <FormattedMessage id="totals-summary" defaultMessage="ملخص الحسابات" />
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={500}>
                    <FormattedMessage id="current-balance" />
                  </Typography>
                  <Typography fontWeight={700}>{currentBalance.toFixed(2)}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography fontWeight={500} gutterBottom>
                    <FormattedMessage id="amount" defaultMessage="المبلغ المقبوض" />
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={form.totalAmount || ''}
                    onChange={(event) => setForm((current) => ({ ...current, totalAmount: Number(event.target.value) }))}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={500}>
                    <FormattedMessage id="allocated-amount" />
                  </Typography>
                  <Typography fontWeight={700} color={isOverAllocated ? 'error.main' : 'text.secondary'}>
                    {totalAllocated.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={500}>
                    <FormattedMessage id="unallocated-amount" defaultMessage="غير مخصص" />
                  </Typography>
                  <Typography fontWeight={700} color="text.secondary">
                    {Math.max(0, totalAmount - totalAllocated).toFixed(2)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: isNegativeBalance ? 'error.lighter' : 'grey.50', border: '1px solid', borderColor: isNegativeBalance ? 'error.light' : 'divider' }}>
                  <Typography variant="caption" color={isNegativeBalance ? 'error.main' : 'text.secondary'} display="block" gutterBottom>
                    <FormattedMessage id="resulting-balance" defaultMessage="الرصيد بعد العملية" />
                  </Typography>
                  <Typography variant="h3" color={isNegativeBalance ? 'error.dark' : 'text.primary'} fontWeight={700}>
                    {resultingBalance.toFixed(2)}
                  </Typography>
                  {isNegativeBalance && (
                    <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                      <FormattedMessage id="insufficient-balance" defaultMessage="الرصيد غير كافٍ" />
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: { xs: 0, md: '260px' },
          left: 0,
          bgcolor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <Button component={Link} to={backUrl} disabled={isSaving} sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}>
          <FormattedMessage id="cancel" defaultMessage="إلغاء" />
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {(!isEdit || (isEdit && status === TREASURY_DOCUMENT_STATUS.DRAFT)) && (
            <>
              <Button
                variant="outlined"
                disabled={isSaving || isOverAllocated || totalAmount <= 0 || !paymentMethodSelected}
                onClick={() => onSubmit('draft')}
                sx={{
                  color: 'secondary.dark',
                  borderColor: 'secondary.light',
                  bgcolor: 'secondary.lighter',
                  '&:hover': { bgcolor: 'secondary.light', borderColor: 'secondary.main' }
                }}
              >
                <FormattedMessage id="save-as-draft" defaultMessage="حفظ كمسودة" />
              </Button>
              <PermissionGuard permission={postPermission}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSaving || isOverAllocated || totalAmount <= 0 || !paymentMethodSelected}
                  onClick={() => onSubmit('post')}
                  startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>done_all</span>}
                  sx={{ boxShadow: 1 }}
                >
                  <FormattedMessage id={actionLabelId} defaultMessage="ترحيل السند" />
                </Button>
              </PermissionGuard>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
