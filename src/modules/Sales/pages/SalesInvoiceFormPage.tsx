import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import { IconPlus, IconTrash, IconInfoCircle, IconBox, IconCalculator, IconNotes, IconDeviceFloppy, IconSend } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import { createInvoice, updateInvoice, postInvoice } from '../api/salesApi';
import { useSalesInvoice } from '../hooks/useSales';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';
import { getItemUnits } from 'modules/Inventory/api/inventoryApi';
import type { ItemUnitDto } from 'modules/Inventory/types/inventory.types';
import type { SalesInvoiceInput, SalesLineInput } from '../types/sales.types';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { SALES_PERMISSIONS } from '../utils/sales.constants';
import {
  getCompatibleTreasuryAccounts,
  getInvoicePaymentMethodLabel,
  isDirectInvoicePaymentMethod,
  normalizeInvoicePaymentMethod
} from 'shared/utils/invoiceSettlement';
import type { ApiResponse } from 'types/api';

type EditableLine = SalesLineInput & {
  itemCode?: string;
  unitCode?: string;
  itemName?: string;
  factorToBase?: number;
  priceSource?: 'auto' | 'manual';
  unitOptions: ItemUnitDto[];
};

const today = dayjs().format('YYYY-MM-DD');
const invoiceCurrencyCode = 'EGP';
const SALES_VAT_RATE = 0.14;
const DIRECT_SETTLEMENT_TREASURY_REQUIRED_MESSAGE_ID = 'sales-invoice-direct-settlement-treasury-required';

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function emptyLine(): EditableLine {
  return {
    itemId: '',
    unitOfMeasureId: '',
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    taxAmount: 0,
    notes: '',
    itemCode: '',
    unitCode: '',
    itemName: '',
    factorToBase: 1,
    priceSource: 'auto',
    unitOptions: []
  };
}

type SalesInvoiceFormFieldName = 'customerId' | 'invoiceDate' | 'dueDate' | 'paymentMethod' | 'treasuryAccountId' | 'headerDiscount' | 'otherCharges' | 'notes';

type SalesInvoiceFormFieldErrors = Partial<Record<SalesInvoiceFormFieldName, string>>;

type SalesInvoiceValidationState = {
  summary: string;
  fieldErrors: SalesInvoiceFormFieldErrors;
};

function normalizeValidationMessage(message: string) {
  return message.toLowerCase().trim();
}

function classifySalesInvoiceValidationMessage(message: string, intl: IntlShape): SalesInvoiceFormFieldErrors {
  const normalized = normalizeValidationMessage(message);

  if (!normalized) {
    return {};
  }

  if (
    normalized.includes('treasury account is required for direct invoice settlement') ||
    normalized.includes('treasury account is not linked to a valid accounting account') ||
    normalized.includes('treasury account type is not compatible with the selected payment method')
  ) {
    return {
      treasuryAccountId: intl.formatMessage({
        id: DIRECT_SETTLEMENT_TREASURY_REQUIRED_MESSAGE_ID,
        defaultMessage: 'يجب اختيار حساب خزينة للتسوية المباشرة.'
      })
    };
  }

  if (
    normalized.includes('customerid') && normalized.includes('required') ||
    normalized.includes('customer was not found') ||
    normalized.includes('select a customer first') ||
    normalized.includes('اختر عميلاً أولاً')
  ) {
    return {
      customerId: intl.formatMessage({ id: 'sales-customer-required', defaultMessage: 'اختر عميلاً أولاً.' })
    };
  }

  if (
    normalized.includes('invoice date') && normalized.includes('required') ||
    normalized.includes('invoice date must') ||
    normalized.includes('invoice date')
  ) {
    return { invoiceDate: intl.formatMessage({ id: 'sales-invoice-date-invalid', defaultMessage: 'تاريخ الفاتورة غير صالح.' }) };
  }

  if (normalized.includes('due date') || normalized.includes('تاريخ الاستحقاق')) {
    return {
      dueDate: intl.formatMessage({
        id: 'sales-due-date-invalid',
        defaultMessage: 'تاريخ الاستحقاق يجب ألا يسبق تاريخ الفاتورة.'
      })
    };
  }

  if (normalized.includes('payment method') && normalized.includes('required')) {
    return {
      paymentMethod: intl.formatMessage({
        id: 'sales-payment-method-invalid',
        defaultMessage: 'طريقة الدفع غير صالحة.'
      })
    };
  }

  if (normalized.includes('headerdiscount')) {
    return {
      headerDiscount: intl.formatMessage({
        id: 'sales-header-discount-invalid',
        defaultMessage: 'خصم رأس الفاتورة غير صالح.'
      })
    };
  }

  if (normalized.includes('othercharges')) {
    return {
      otherCharges: intl.formatMessage({
        id: 'sales-other-charges-invalid',
        defaultMessage: 'الرسوم الإضافية غير صالحة.'
      })
    };
  }

  if (normalized.includes('notes') && normalized.includes('maximum')) {
    return {
      notes: intl.formatMessage({
        id: 'sales-notes-too-long',
        defaultMessage: 'الملاحظات طويلة جداً.'
      })
    };
  }

  return {};
}

function resolveSalesInvoiceValidationState(error: unknown, intl: IntlShape): SalesInvoiceValidationState {
  const apiError = error as { response?: { data?: ApiResponse<unknown> } } | undefined;
  const response = apiError?.response?.data;
  const messages = [
    ...(response?.errors ?? []),
    typeof response?.message === 'string' ? response.message : '',
    error instanceof Error ? error.message : ''
  ]
    .map((message) => message.trim())
    .filter((message) => {
      const normalized = normalizeValidationMessage(message);
      return Boolean(message) && normalized !== 'validation failed' && normalized !== 'request failed';
    });

  const fieldErrors: SalesInvoiceFormFieldErrors = {};
  const summaryMessages: string[] = [];

  messages.forEach((message) => {
    const classified = classifySalesInvoiceValidationMessage(message, intl);
    const fieldName = Object.keys(classified)[0] as SalesInvoiceFormFieldName | undefined;

    if (fieldName) {
      fieldErrors[fieldName] = classified[fieldName]!;
      return;
    }

    summaryMessages.push(message);
  });

  return {
    fieldErrors,
    summary:
      summaryMessages[0] ??
      intl.formatMessage({
        id: 'sales-action-failed',
        defaultMessage: 'Sales action failed.'
      })
  };
}

export default function SalesInvoiceFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { invoice, isLoading } = useSalesInvoice(id);
  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { items: inventoryItems } = useInventoryItems({ page: 1, pageSize: 100, search: '' });
  const { items: treasuryAccounts, isLoading: isTreasuryAccountsLoading } = useTreasuryAccounts({ page: 1, pageSize: 100, isActive: true });
  const [form, setForm] = useState<SalesInvoiceInput>(() => ({
    customerId: searchParams.get('customerId') ?? '',
    invoiceDate: today,
    dueDate: '',
    customerReferenceNumber: searchParams.get('customerReferenceNumber') ?? '',
    headerDiscount: 0,
    otherCharges: 0,
    notes: searchParams.get('notes') ?? '',
    lines: [],
    paymentMethod: 'Credit',
    treasuryAccountId: null
  }));
  const [rows, setRows] = useState<EditableLine[]>([emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SalesInvoiceFormFieldErrors>({});

  useEffect(() => {
    let active = true;

    if (invoice) {
        setForm({
          customerId: invoice.customerId,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate ?? '',
          customerReferenceNumber: invoice.customerReferenceNumber ?? '',
          headerDiscount: invoice.headerDiscount,
          otherCharges: invoice.otherCharges,
          notes: invoice.notes ?? '',
          lines: [],
          paymentMethod: normalizeInvoicePaymentMethod(invoice.paymentMethod) ?? 'Credit',
          treasuryAccountId: invoice.treasuryAccountId ?? null
        });

      Promise.all(
        invoice.lines.map(async (line): Promise<EditableLine> => {
          const unitOptions = await getItemUnits(line.itemId).catch(() => []);
          const selectedUnit = unitOptions.find((unit) => unit.unitOfMeasureId === line.unitOfMeasureId);
          return {
            itemId: line.itemId,
            unitOfMeasureId: line.unitOfMeasureId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount,
            taxAmount: 0,
            notes: line.notes ?? '',
            itemCode: line.itemCode,
            unitCode: line.unitCode,
            itemName: line.itemNameArabic,
            factorToBase: selectedUnit?.conversionFactor ?? selectedUnit?.factorToBase ?? line.conversionFactor,
            priceSource: 'manual',
            unitOptions
          };
        })
      ).then((loadedRows) => {
        if (active) setRows(loadedRows);
      });
    }

    return () => {
      active = false;
    };
  }, [invoice]);

  const itemLookup = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems]);
  const customerLookup = useMemo(() => new Map(customers.map((s) => [s.id, s])), [customers]);
  const compatibleTreasuryAccounts = useMemo(
    () => getCompatibleTreasuryAccounts(treasuryAccounts, form.paymentMethod, invoice?.currencyCode ?? invoiceCurrencyCode),
    [form.paymentMethod, invoice?.currencyCode, treasuryAccounts]
  );
  const selectedTreasuryAccount = useMemo(
    () => compatibleTreasuryAccounts.find((account) => account.id === form.treasuryAccountId) ?? null,
    [compatibleTreasuryAccounts, form.treasuryAccountId]
  );

  useEffect(() => {
    if (!isDirectInvoicePaymentMethod(form.paymentMethod)) {
      if (form.treasuryAccountId) {
        setForm((current) => ({ ...current, treasuryAccountId: null }));
      }
      return;
    }

    if (compatibleTreasuryAccounts.length === 1) {
      const onlyAccount = compatibleTreasuryAccounts[0];
      if (form.treasuryAccountId !== onlyAccount.id) {
        setForm((current) => ({ ...current, treasuryAccountId: onlyAccount.id }));
      }
      return;
    }

    if (form.treasuryAccountId && !compatibleTreasuryAccounts.some((account) => account.id === form.treasuryAccountId)) {
      setForm((current) => ({ ...current, treasuryAccountId: null }));
    }
  }, [compatibleTreasuryAccounts, form.paymentMethod, form.treasuryAccountId]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateRow = (index: number, next: Partial<EditableLine>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const resolveSuggestedUnitPrice = (itemId: string, unitOptions: ItemUnitDto[], unitId?: string) => {
    const item = itemLookup.get(itemId);
    if (!item) {
      return 0;
    }

    const selectedUnit = unitOptions.find((unit) => unit.unitOfMeasureId === unitId);
    if (selectedUnit) {
      return selectedUnit.effectiveSalePrice ?? item.defaultSalePrice;
    }

    return item.defaultSalePrice;
  };

  const addRow = () => setRows((current) => [...current, emptyLine()]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  const dueDateError = Boolean(form.dueDate && form.dueDate < form.invoiceDate);
  const settlementRequiresTreasuryAccount = isDirectInvoicePaymentMethod(form.paymentMethod);
  const treasurySelectionError =
    settlementRequiresTreasuryAccount && !form.treasuryAccountId && compatibleTreasuryAccounts.length > 0
      ? intl.formatMessage({
          id: DIRECT_SETTLEMENT_TREASURY_REQUIRED_MESSAGE_ID,
          defaultMessage: 'يجب اختيار حساب خزينة للتسوية المباشرة.'
        })
      : '';
  const treasuryAvailabilityWarning =
    settlementRequiresTreasuryAccount && compatibleTreasuryAccounts.length === 0
      ? intl.formatMessage({
          id: 'invoice-settlement.no-compatible-account',
          defaultMessage: 'No active treasury account is compatible with the selected payment method and invoice currency.'
        })
      : '';

  const onItemChange = async (index: number, itemId: string) => {
    const item = itemLookup.get(itemId);
    if (!item) {
      updateRow(index, {
        itemId: '',
        itemCode: '',
        itemName: '',
        unitOfMeasureId: '',
        unitCode: '',
        factorToBase: 1,
        unitPrice: 0,
        priceSource: 'auto',
        unitOptions: []
      });
      return;
    }

    const unitOptions = await getItemUnits(itemId).catch(() => []);
    const selectedUnit =
      unitOptions.find((unit) => unit.isDefaultSalesUnit) ??
      unitOptions.find((unit) => unit.unitOfMeasureId === item.baseUnitId) ??
      unitOptions[0];

    updateRow(index, {
      itemId,
      itemCode: item.code,
      itemName: item.nameArabic,
      unitOfMeasureId: selectedUnit?.unitOfMeasureId ?? item.baseUnitId,
      unitCode: selectedUnit?.unitCode ?? item.baseUnitCode,
      factorToBase: selectedUnit?.conversionFactor ?? selectedUnit?.factorToBase ?? 1,
      unitPrice: resolveSuggestedUnitPrice(itemId, unitOptions, selectedUnit?.unitOfMeasureId ?? item.baseUnitId),
      priceSource: 'auto',
      unitOptions
    });
  };

  const submit = async (actionType: 'draft' | 'post') => {
    if (!form.customerId) {
      notify(intl.formatMessage({ id: 'sales-customer-required' }), 'error');
      return;
    }
    if (form.dueDate && form.dueDate < form.invoiceDate) {
      notify(intl.formatMessage({ id: 'sales-due-date-invalid', defaultMessage: 'تاريخ الاستحقاق يجب ألا يسبق تاريخ الفاتورة.' }), 'error');
      return;
    }
    const lines = rows
      .filter((row) => row.itemId && row.unitOfMeasureId)
      .map(({ itemId, unitOfMeasureId, quantity, unitPrice, discountAmount, notes }) => ({
        itemId,
        unitOfMeasureId,
        quantity: safeNumber(Number(quantity)),
        unitPrice: safeNumber(Number(unitPrice)),
        discountAmount: safeNumber(Number(discountAmount)),
        taxAmount: 0,
        notes: notes || null
      }));

    if (lines.length === 0) {
      notify(intl.formatMessage({ id: 'sales-lines-required' }), 'error');
      return;
    }

    const request: SalesInvoiceInput = {
      ...form,
      dueDate: form.dueDate || null,
      customerReferenceNumber: form.customerReferenceNumber || null,
      notes: form.notes || null,
      treasuryAccountId: form.paymentMethod === 'Credit' ? null : form.treasuryAccountId,
      lines
    };

    try {
      setIsSaving(true);
      setFieldErrors({});
      let savedInvoiceId = '';
      let savedRowVersion = '';

      if (isEdit && invoice) {
        const saved = await updateInvoice(invoice.id, { ...request, rowVersion: invoice.rowVersion });
        savedInvoiceId = saved.id;
        savedRowVersion = saved.rowVersion;
      } else {
        const saved = await createInvoice(request);
        savedInvoiceId = saved.id;
        savedRowVersion = saved.rowVersion;
      }

      if (actionType === 'post') {
         await postInvoice(savedInvoiceId, savedRowVersion);
         notify(intl.formatMessage({ id: 'sales-action-success' }));
         navigate(`/sales/invoices/${savedInvoiceId}`);
      } else {
         notify(intl.formatMessage({ id: 'sales-action-success' }));
         navigate(`/sales/invoices/${savedInvoiceId}`);
      }

    } catch (saveError) {
      const validationState = resolveSalesInvoiceValidationState(saveError, intl);
      if (Object.keys(validationState.fieldErrors).length > 0) {
        setFieldErrors(validationState.fieldErrors);
      }

      notify(validationState.summary, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = roundMoney(rows.reduce((sum, row) => sum + safeNumber(Number(row.quantity)) * safeNumber(Number(row.unitPrice)), 0));
  const totalLineDiscount = roundMoney(rows.reduce((sum, row) => sum + safeNumber(Number(row.discountAmount)), 0));
  const headerDiscount = roundMoney(safeNumber(Number(form.headerDiscount)));
  const taxableSales = roundMoney(Math.max(0, subtotal - totalLineDiscount - headerDiscount));
  const totalTax = roundMoney(taxableSales * SALES_VAT_RATE);
  const grandTotal = roundMoney(taxableSales + totalTax);

  if (isEdit && isLoading) return <Loader />;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3, borderRadius: 2 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ mb: 3 }}>
         <Breadcrumbs custom card={false} title={false} divider={false} heading={isEdit ? 'edit-sales-invoice' : 'create-sales-invoice'} links={[{ title: 'sales', to: '/sales/invoices' }, { title: 'sales-invoices', to: '/sales/invoices' }]} sx={{ mb: 0 }} />
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <PageTitle><FormattedMessage id={isEdit ? 'edit-sales-invoice' : 'create-sales-invoice'} /></PageTitle>
            {isEdit && invoice && (
               <Box sx={{ px: 2, py: 0.5, bgcolor: 'grey.100', color: 'text.secondary', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id={`sales.status.${invoice.status.toLowerCase()}`} /></Typography>
               </Box>
            )}
         </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        سيتم ترحيل الفاتورة على حساب العملاء وحساب إيرادات المبيعات.
      </Alert>

      {/* Basic Info Card */}
      <MainCard sx={cardSx} content={false}>
         <Box sx={{ p: 3 }}>
            <Box sx={headerSx}>
               <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
               <Typography variant="h4" fontWeight={600}><FormattedMessage id="basic-information" /></Typography>
            </Box>
            <Grid container spacing={4}>
               <Grid item xs={12} md={4}>
              <Autocomplete
                     options={customers}
                     getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                     value={customerLookup.get(form.customerId) || null}
                     onChange={(_, newValue) => setForm({ ...form, customerId: newValue?.id || '' })}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         required
                         label={<FormattedMessage id="customer" />}
                         variant="outlined"
                         InputLabelProps={{ shrink: true }}
                         error={Boolean(fieldErrors.customerId)}
                         helperText={fieldErrors.customerId ?? ' '}
                       />
                     )}
                  />
               </Grid>
               <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    label={<FormattedMessage id="invoice-date" />}
                    value={form.invoiceDate}
                    onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })}
                    error={Boolean(fieldErrors.invoiceDate)}
                    helperText={fieldErrors.invoiceDate ?? ' '}
                  />
               </Grid>
               <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    label={<FormattedMessage id="due-date" defaultMessage="تاريخ الاستحقاق" />}
                    value={form.dueDate || ''}
                    onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                    error={dueDateError || Boolean(fieldErrors.dueDate)}
                    helperText={
                      fieldErrors.dueDate ??
                      (dueDateError
                        ? intl.formatMessage({ id: 'sales-due-date-invalid', defaultMessage: 'تاريخ الاستحقاق يجب ألا يسبق تاريخ الفاتورة.' })
                        : intl.formatMessage({ id: 'optional-field', defaultMessage: 'اختياري' }))
                    }
                  />
               </Grid>
               <Grid item xs={12} md={4}>
                  <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                     <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="invoice-number" /></Typography>
                     <Typography variant="body1" fontWeight={600}>{isEdit ? invoice?.number : intl.formatMessage({ id: 'auto-generated' })}</Typography>
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </MainCard>

      <MainCard sx={cardSx} content={false}>
        <Box sx={{ p: 3 }}>
          <Box sx={headerSx}>
            <IconSend color="var(--mui-palette-primary-main)" size={24} />
            <Typography variant="h4" fontWeight={600}>
              <FormattedMessage id="payment-method" defaultMessage="Payment Method" />
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <FormattedMessage
              id="sales-direct-settlement-help"
              defaultMessage="Cash, Wallet, and InstaPay invoices are settled automatically when posted. Credit invoices remain outstanding until collected later."
            />
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                required
                label={<FormattedMessage id="payment-method" defaultMessage="Payment Method" />}
                value={form.paymentMethod}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentMethod: event.target.value as SalesInvoiceInput['paymentMethod'],
                    treasuryAccountId: event.target.value === 'Credit' ? null : current.treasuryAccountId
                  }))
                }
                error={Boolean(fieldErrors.paymentMethod)}
                helperText={fieldErrors.paymentMethod ?? ' '}
              >
                <MenuItem value="Credit">{getInvoicePaymentMethodLabel(intl.locale, 'Credit')}</MenuItem>
                <MenuItem value="Cash">{getInvoicePaymentMethodLabel(intl.locale, 'Cash')}</MenuItem>
                <MenuItem value="Wallet">{getInvoicePaymentMethodLabel(intl.locale, 'Wallet')}</MenuItem>
                <MenuItem value="InstaPay">{getInvoicePaymentMethodLabel(intl.locale, 'InstaPay')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              {settlementRequiresTreasuryAccount ? (
                compatibleTreasuryAccounts.length === 0 ? (
                  <Alert severity={fieldErrors.treasuryAccountId ? 'error' : 'warning'} variant="outlined">
                    {fieldErrors.treasuryAccountId ?? treasuryAvailabilityWarning}
                  </Alert>
                ) : compatibleTreasuryAccounts.length === 1 ? (
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}
                    value={compatibleTreasuryAccounts[0].nameArabic}
                    InputProps={{ readOnly: true }}
                    error={Boolean(fieldErrors.treasuryAccountId)}
                    helperText={fieldErrors.treasuryAccountId ?? treasurySelectionError ?? (
                      <FormattedMessage id="invoice-settlement.auto-selected-account" defaultMessage="تم اختيار حساب الخزينة المتوافق تلقائياً." />
                    )}
                  />
                ) : (
                  <Autocomplete
                    options={compatibleTreasuryAccounts}
                    value={selectedTreasuryAccount}
                    loading={isTreasuryAccountsLoading}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.nameArabic}
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.nameArabic}
                      </li>
                    )}
                    onChange={(_, newValue) => setForm((current) => ({ ...current, treasuryAccountId: newValue?.id ?? null }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}
                        error={Boolean(fieldErrors.treasuryAccountId)}
                        helperText={fieldErrors.treasuryAccountId ?? treasurySelectionError ?? (
                          <FormattedMessage
                            id="invoice-settlement.select-compatible-account"
                            defaultMessage="اختر حساب خزينة نشط متوافق مع طريقة الدفع وعملة الفاتورة."
                          />
                        )}
                      />
                    )}
                  />
                )
              ) : (
                <TextField
                  fullWidth
                  label={<FormattedMessage id="treasury-account" defaultMessage="Treasury Account" />}
                  value={intl.formatMessage({ id: 'invoice-settlement.credit-no-treasury-account', defaultMessage: 'Not required for Credit invoices.' })}
                  InputProps={{ readOnly: true }}
                  helperText={<FormattedMessage id="invoice-settlement.credit-outstanding" defaultMessage="Credit invoices remain outstanding until collected later." />}
                />
              )}
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      {/* Item Details Card */}
      <MainCard sx={cardSx} content={false}>
         <Box sx={{ p: 3 }}>
            <Box sx={headerSx}>
               <IconBox color="var(--mui-palette-primary-main)" size={24} />
               <Typography variant="h4" fontWeight={600}><FormattedMessage id="item-details" /></Typography>
            </Box>
            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
               <Table size="small" sx={{ minWidth: 1080 }}>
                 <TableHead sx={{ bgcolor: 'grey.50' }}>
                   <TableRow>
                     <TableCell align="center" width={40}>#</TableCell>
                     <TableCell sx={{ minWidth: 200 }}><FormattedMessage id="item" /></TableCell>
                     <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="quantity" /></TableCell>
                     <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="unit" /></TableCell>
                     <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="unit-price" /></TableCell>
                     <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="discount" /></TableCell>
                     <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="line-total" /></TableCell>
                     <TableCell align="center" width={60}><FormattedMessage id="actions" /></TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {rows.map((row, index) => {
                      const lineTotal = roundMoney(safeNumber(Number(row.quantity)) * safeNumber(Number(row.unitPrice)) - safeNumber(Number(row.discountAmount)));
                      return (
                      <TableRow key={`${row.itemId || 'line'}-${index}`} hover>
                        {[
                          <TableCell key="index" align="center">{index + 1}</TableCell>,
                          <TableCell key="item">
                             <Autocomplete
                                size="small"
                                options={inventoryItems.filter((item) => item.isSellable)}
                                getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                                value={itemLookup.get(row.itemId) || null}
                                onChange={(_, newValue) => onItemChange(index, newValue?.id || '')}
                                renderInput={(params) => <TextField {...params} variant="outlined" placeholder={intl.formatMessage({ id: 'search-item' })} />}
                             />
                          </TableCell>,
                          <TableCell key="quantity">
                            <TextField size="small" fullWidth type="number" value={row.quantity} onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })} inputProps={{ min: 1 }} />
                          </TableCell>,
                          <TableCell key="unit">
                            <TextField
                              size="small"
                              select
                              fullWidth
                              value={row.unitOfMeasureId}
                              onChange={(event) => {
                                const selectedUnit = row.unitOptions.find((unit) => unit.unitOfMeasureId === event.target.value);
                                updateRow(index, {
                                  unitOfMeasureId: event.target.value,
                                  unitCode: selectedUnit?.unitCode ?? '',
                                  factorToBase: selectedUnit?.conversionFactor ?? selectedUnit?.factorToBase ?? 1,
                                  unitPrice: resolveSuggestedUnitPrice(row.itemId, row.unitOptions, event.target.value),
                                  priceSource: 'auto'
                                });
                              }}
                            >
                              {row.unitOptions.map((unit) => (
                                <MenuItem key={unit.unitOfMeasureId} value={unit.unitOfMeasureId}>
                                  {unit.unitCode}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>,
                          <TableCell key="price">
                            <TextField
                              size="small"
                              fullWidth
                              type="number"
                              value={row.unitPrice}
                              onChange={(event) => updateRow(index, { unitPrice: Number(event.target.value), priceSource: 'manual' })}
                              inputProps={{ step: 0.0001, min: 0 }}
                            />
                          </TableCell>,
                          <TableCell key="discount">
                            <TextField size="small" fullWidth type="number" value={row.discountAmount} onChange={(event) => updateRow(index, { discountAmount: Number(event.target.value) })} />
                          </TableCell>,
                          <TableCell key="total">
                             <Typography fontWeight={600} color="primary.main">{lineTotal.toFixed(2)}</Typography>
                          </TableCell>,
                          <TableCell key="actions" align="center">
                            <Tooltip title={<FormattedMessage id="remove" />}>
                              <span>
                                <IconButton onClick={() => removeRow(index)} disabled={rows.length === 1} color="error" size="small">
                                  <IconTrash size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        ]}
                      </TableRow>
                   )})}
                 </TableBody>
               </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
               <Button
                  variant="outlined"
                  color="primary"
                  onClick={addRow}
                  startIcon={<IconPlus size={18} />}
                  sx={{ borderRadius: 2, px: 3 }}
               >
                  <FormattedMessage id="add-item" defaultMessage="إضافة صنف جديد" />
               </Button>
            </Box>
         </Box>
      </MainCard>

      {/* Bottom Section: Notes and Summary */}
      <Grid container spacing={3}>
         {/* Invoice Notes */}
         <Grid item xs={12} md={6}>
            <MainCard sx={{ ...cardSx, height: '100%', mb: 0 }} content={false}>
               <Box sx={{ p: 3 }}>
                  <Box sx={headerSx}>
                     <IconNotes color="var(--mui-palette-primary-main)" size={24} />
                     <Typography variant="h4" fontWeight={600}><FormattedMessage id="invoice-notes" /></Typography>
                  </Box>
                  <TextField
                     fullWidth
                     multiline
                     minRows={5}
                     placeholder={intl.formatMessage({ id: 'notes-placeholder', defaultMessage: 'أضف أي ملاحظات أو شروط خاصة بهذه الفاتورة هنا...' })}
                     value={form.notes ?? ''}
                     onChange={(event) => setForm({ ...form, notes: event.target.value })}
                     sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.50' } }}
                  />
               </Box>
            </MainCard>
         </Grid>

         {/* Account Summary */}
         <Grid item xs={12} md={6}>
            <MainCard sx={{ ...cardSx, height: '100%', mb: 0 }} content={false}>
               <Box sx={{ p: 3 }}>
                  <Box sx={headerSx}>
                     <IconCalculator color="var(--mui-palette-primary-main)" size={24} />
                     <Typography variant="h4" fontWeight={600}><FormattedMessage id="totals-summary" defaultMessage="ملخص الحسابات" /></Typography>
                  </Box>
                  <Stack spacing={2.5}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="subtotal" /></Typography>
                        <Typography fontWeight={600} fontSize="1.1rem">{subtotal.toFixed(2)}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="line-discounts" /></Typography>
                        <Typography fontWeight={600} color="text.secondary">- {totalLineDiscount.toFixed(2)}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="header-discount" /></Typography>
                        <TextField size="small" type="number" value={form.headerDiscount} onChange={(e) => setForm({ ...form, headerDiscount: Number(e.target.value) })} sx={{ width: 120 }} />
                      </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="sales-vat-14" defaultMessage="ضريبة القيمة المضافة (14%)" /></Typography>
                        <Typography fontWeight={600} color="text.secondary">{totalTax.toFixed(2)}</Typography>
                     </Box>
                     <Divider sx={{ my: 1 }} />
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h3" fontWeight={700}><FormattedMessage id="grand-total" defaultMessage="الإجمالي النهائي" /></Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, color: 'primary.main' }}>
                           <Typography variant="h2" fontWeight={800}>{grandTotal.toFixed(2)}</Typography>
                           <Typography variant="body1" fontWeight={600} color="text.secondary"><FormattedMessage id="currency" /></Typography>
                        </Box>
                     </Box>
                  </Stack>
               </Box>
            </MainCard>
         </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, mb: 2, gap: 2 }}>
         <Button component={Link} to="/sales/invoices" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2, px: 4 }}>
            <FormattedMessage id="cancel" />
         </Button>
         <Button variant="contained" color="secondary" onClick={() => submit('draft')} disabled={isSaving} sx={{ borderRadius: 2, px: 4 }} startIcon={<IconDeviceFloppy size={18} />}>
            <FormattedMessage id="save-as-draft" />
         </Button>
         {(!isEdit || (isEdit && invoice?.status === 'Draft')) && (
            <PermissionGuard permission={SALES_PERMISSIONS.invoicesPost}>
                <Button
                 variant="contained"
                 color="primary"
                 onClick={() => submit('post')}
                 disabled={isSaving || (settlementRequiresTreasuryAccount && !selectedTreasuryAccount)}
                 sx={{ borderRadius: 2, px: 4, boxShadow: 2 }}
                 startIcon={<IconSend size={18} />}
               >
                  <FormattedMessage id="post-invoice" defaultMessage="ترحيل الفاتورة" />
               </Button>
            </PermissionGuard>
         )}
      </Box>
    </Box>
  );
}
