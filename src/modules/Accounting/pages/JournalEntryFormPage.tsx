import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { createJournalEntry, updateJournalEntry } from '../api/journalEntryApi';
import { useJournalEntry, useJournalEntryAccounts } from '../hooks/useJournalEntries';
import { journalEntryFormSchema, type JournalEntryFormSchema } from '../schemas/journal-entry.schema';
import type { JournalEntryLineFormValues, JournalEntryRequest } from '../types/journal-entry.types';
import { JOURNAL_ENTRY_PERMISSIONS, JOURNAL_ENTRY_ACCOUNT_LOOKUP_PAGE_SIZE } from '../utils/journal-entry.constants';
import { formatJournalEntryStatus } from '../utils/journal-entry.format';

function todayDateInputValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createLine(): JournalEntryLineFormValues {
  return {
    accountId: '',
    debitAmount: '',
    creditAmount: '',
    descriptionArabic: '',
    descriptionEnglish: ''
  };
}

function toFormValues(entry?: ReturnType<typeof useJournalEntry>['entry']): JournalEntryFormSchema {
  return {
    entryDate: entry?.entryDate ?? todayDateInputValue(),
    descriptionArabic: entry?.descriptionArabic ?? '',
    descriptionEnglish: entry?.descriptionEnglish ?? '',
    lines:
      entry?.lines.map((line) => ({
        accountId: line.accountId,
        debitAmount: line.debitAmount ? String(line.debitAmount) : '',
        creditAmount: line.creditAmount ? String(line.creditAmount) : '',
        descriptionArabic: line.descriptionArabic ?? '',
        descriptionEnglish: line.descriptionEnglish ?? ''
      })) ?? [createLine(), createLine()],
    rowVersion: entry?.rowVersion
  };
}

function toRequest(values: JournalEntryFormSchema): JournalEntryRequest {
  const descriptionArabic = values.descriptionArabic ?? '';
  const descriptionEnglish = values.descriptionEnglish ?? '';

  return {
    entryDate: values.entryDate,
    descriptionArabic: descriptionArabic.trim() ? descriptionArabic.trim() : null,
    descriptionEnglish: descriptionEnglish.trim() ? descriptionEnglish.trim() : null,
    lines: values.lines.map((line) => ({
      accountId: line.accountId,
      debitAmount: Number(line.debitAmount || 0),
      creditAmount: Number(line.creditAmount || 0),
      descriptionArabic: (line.descriptionArabic ?? '').trim() ? (line.descriptionArabic ?? '').trim() : null,
      descriptionEnglish: (line.descriptionEnglish ?? '').trim() ? (line.descriptionEnglish ?? '').trim() : null
    }))
  };
}

export default function JournalEntryFormPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: mutateGlobal } = useSWRConfig();
  const isEdit = Boolean(id);

  const { entry, isLoading } = useJournalEntry(id);
  const { items: accounts } = useJournalEntryAccounts({ page: 1, pageSize: JOURNAL_ENTRY_ACCOUNT_LOOKUP_PAGE_SIZE });

  const form = useForm<JournalEntryFormSchema>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: toFormValues()
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines'
  });

  useEffect(() => {
    if (entry) {
      form.reset(toFormValues(entry));
    }
  }, [entry, form]);

  const lineValues = form.watch('lines');
  const totals = useMemo(() => {
    const debit = lineValues.reduce((sum, line) => sum + Number(line.debitAmount || 0), 0);
    const credit = lineValues.reduce((sum, line) => sum + Number(line.creditAmount || 0), 0);
    return { debit, credit, balanced: debit === credit && debit > 0 };
  }, [lineValues]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (values: JournalEntryFormSchema) => {
    const request = toRequest(values);

    try {
      if (isEdit && entry) {
        const updated = await updateJournalEntry(entry.id, { ...request, rowVersion: entry.rowVersion });
        notify(intl.formatMessage({ id: 'journal-entry-updated-successfully', defaultMessage: 'Journal entry updated successfully.' }));
        await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
        navigate(`/accounting/journal-entries/${updated.id}`);
      } else {
        const created = await createJournalEntry(request);
        notify(intl.formatMessage({ id: 'journal-entry-created-successfully', defaultMessage: 'Journal entry created successfully.' }));
        await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
        navigate(`/accounting/journal-entries/${created.id}`);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'journal-entry-action-failed', defaultMessage: 'Journal entry action failed.' }), 'error');
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  return (
    <Box component="form" onSubmit={form.handleSubmit(submit)}>
      <Breadcrumbs
        custom
        heading={isEdit ? 'edit-journal-entry' : 'create-journal-entry'}
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'journal-entries', to: '/accounting/journal-entries' },
          { title: isEdit ? 'edit-journal-entry' : 'create-journal-entry' }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id={isEdit ? 'edit-journal-entry' : 'create-journal-entry'} defaultMessage={isEdit ? 'Edit journal entry' : 'Create journal entry'} />
            </PageTitle>
            {isEdit && entry && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {entry.number} - {formatJournalEntryStatus(entry.status, intl.locale)}
              </Typography>
            )}
          </Box>
        </Box>

        <MainCard sx={{ borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                control={form.control}
                name="entryDate"
                render={({ field, fieldState }) => (
                  <TextField {...field} type="date" fullWidth label={<FormattedMessage id="date" />} InputLabelProps={{ shrink: true }} error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                control={form.control}
                name="descriptionArabic"
                render={({ field, fieldState }) => (
                  <TextField {...field} fullWidth label={<FormattedMessage id="description-arabic" />} error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                control={form.control}
                name="descriptionEnglish"
                render={({ field, fieldState }) => (
                  <TextField {...field} fullWidth label={<FormattedMessage id="description-english" />} error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
            </Grid>
          </Grid>
        </MainCard>

        <MainCard sx={{ borderRadius: 3 }} content={false}>
          <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" fontWeight={700}>
              <FormattedMessage id="journal-entry-lines" defaultMessage="Journal entry lines" />
            </Typography>
            <Button variant="outlined" startIcon={<IconPlus size={18} />} onClick={() => append(createLine())}>
              <FormattedMessage id="add-line" />
            </Button>
          </Box>
          <Divider />
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>
                    <FormattedMessage id="account" defaultMessage="Account" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="debit" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="credit" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="description-arabic" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="description-english" />
                  </TableCell>
                  <TableCell align="center">
                    <FormattedMessage id="actions" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Controller
                        control={form.control}
                        name={`lines.${index}.accountId`}
                        render={({ field: lineField, fieldState }) => (
                          <TextField {...lineField} select fullWidth size="small" error={!!fieldState.error} helperText={fieldState.error?.message}>
                            <MenuItem value="">
                              <FormattedMessage id="select" defaultMessage="Select" />
                            </MenuItem>
                            {accounts.map((account) => (
                              <MenuItem key={account.id} value={account.id}>
                                {account.code} - {account.nameArabic}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Controller
                        control={form.control}
                        name={`lines.${index}.debitAmount`}
                        render={({ field: lineField, fieldState }) => (
                          <TextField {...lineField} type="number" size="small" fullWidth inputProps={{ min: 0, step: 0.01 }} error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Controller
                        control={form.control}
                        name={`lines.${index}.creditAmount`}
                        render={({ field: lineField, fieldState }) => (
                          <TextField {...lineField} type="number" size="small" fullWidth inputProps={{ min: 0, step: 0.01 }} error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Controller
                        control={form.control}
                        name={`lines.${index}.descriptionArabic`}
                        render={({ field }) => <TextField {...field} size="small" fullWidth />}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Controller
                        control={form.control}
                        name={`lines.${index}.descriptionEnglish`}
                        render={({ field }) => <TextField {...field} size="small" fullWidth />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => remove(index)} disabled={fields.length <= 2} color="error" size="small">
                        <IconTrash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ p: 3, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="total-debit" defaultMessage="Total debit" />
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {totals.debit.toFixed(2)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="total-credit" defaultMessage="Total credit" />
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {totals.credit.toFixed(2)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="balanced-entry" defaultMessage="Balanced entry" />
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color={totals.balanced ? 'success.main' : 'error.main'}>
                    {totals.balanced ? intl.formatMessage({ id: 'yes' }) : intl.formatMessage({ id: 'no' })}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </MainCard>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button component={Link} to="/accounting/journal-entries" variant="outlined" color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <PermissionGuard permission={isEdit ? JOURNAL_ENTRY_PERMISSIONS.update : JOURNAL_ENTRY_PERMISSIONS.create}>
            <Button type="submit" variant="contained" startIcon={<IconDeviceFloppy size={18} />}>
              <FormattedMessage id="save" />
            </Button>
          </PermissionGuard>
        </Box>
      </Stack>
    </Box>
  );
}
