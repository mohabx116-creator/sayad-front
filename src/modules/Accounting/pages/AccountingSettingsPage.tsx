import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconCheck } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { updateAccountingSettingsMappings } from '../api/accountingSettingsApi';
import { useAccountingSettings } from '../hooks/useAccountingSettings';
import { useJournalEntryAccounts } from '../hooks/useJournalEntries';
import type { AccountingSettingMappingInput } from '../types/accounting-settings.types';
import { ACCOUNTING_SETTING_MAPPINGS } from '../utils/accounting.settings';

type MappingRow = AccountingSettingMappingInput;

function getDisplayLabel(locale: string, labelArabic: string, labelEnglish: string) {
  return locale.toLowerCase().startsWith('ar') ? labelArabic : labelEnglish;
}

export default function AccountingSettingsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateGlobal } = useSWRConfig();

  const { mappings, isLoading: mappingsLoading, error } = useAccountingSettings();
  const { items: accountOptions, isLoading: accountsLoading } = useJournalEntryAccounts({ page: 1, pageSize: 100 });

  const [rows, setRows] = useState<MappingRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mappings.length > 0) {
      setRows(
        ACCOUNTING_SETTING_MAPPINGS.map((definition) => {
          const current = mappings.find((mapping) => mapping.mappingKey === definition.key);
          return {
            mappingKey: definition.key,
            accountId: current?.accountId ?? null,
            rowVersion: current?.rowVersion ?? null
          };
        })
      );
    }
  }, [mappings]);

  const canSave = useMemo(() => rows.length === ACCOUNTING_SETTING_MAPPINGS.length && rows.every((row) => Boolean(row.accountId)), [rows]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleChange = (index: number, accountId: string) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, accountId: accountId || null } : row)));
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateAccountingSettingsMappings(rows);
      setRows(updated.map((mapping) => ({ mappingKey: mapping.mappingKey, accountId: mapping.accountId, rowVersion: mapping.rowVersion })));
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
      notify(intl.formatMessage({ id: 'accounting-settings-saved', defaultMessage: 'تم حفظ إعدادات المحاسبة بنجاح.' }));
    } catch (err) {
      notify(err instanceof Error ? err.message : intl.formatMessage({ id: 'accounting-settings-save-failed', defaultMessage: 'تعذر حفظ إعدادات المحاسبة.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (mappingsLoading || accountsLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs custom heading="accounting-settings" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'accounting-settings' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="accounting-settings" defaultMessage="إعدادات المحاسبة" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="accounting-settings-description"
                defaultMessage="اضبط الحسابات المركزية المستخدمة في مسارات الترحيل التلقائي المستقبلية."
              />
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              color={rows.filter((row) => Boolean(row.accountId)).length === ACCOUNTING_SETTING_MAPPINGS.length ? 'success' : 'warning'}
              label={`${rows.filter((row) => Boolean(row.accountId)).length}/${ACCOUNTING_SETTING_MAPPINGS.length}`}
            />
            <Button variant="contained" onClick={handleSave} startIcon={<IconCheck size={18} />} disabled={!canSave || isSaving}>
              <FormattedMessage id="save" />
            </Button>
          </Stack>
        </Box>

        {error && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {error instanceof Error ? error.message : intl.formatMessage({ id: 'accounting-settings-load-error', defaultMessage: 'تعذر تحميل إعدادات المحاسبة.' })}
            </Typography>
          </Card>
        )}

        <MainCard contentSX={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="mapping" defaultMessage="الربط" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="account" defaultMessage="الحساب" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="status" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const definition = ACCOUNTING_SETTING_MAPPINGS[index];
                const selectedAccount = accountOptions.find((account) => account.id === row.accountId) ?? null;

                return (
                  <TableRow key={definition.key} hover>
                    <TableCell sx={{ minWidth: 280 }}>
                      <Stack spacing={0.5}>
                        <Typography fontWeight={700}>{getDisplayLabel(intl.locale, definition.labelArabic, definition.labelEnglish)}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ minWidth: 360 }}>
                      <TextField select fullWidth value={row.accountId ?? ''} onChange={(event) => handleChange(index, event.target.value)}>
                        <MenuItem value="">
                          <FormattedMessage id="select-account" defaultMessage="اختر حسابًا" />
                        </MenuItem>
                        {accountOptions.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.code} - {account.nameArabic}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      {selectedAccount ? (
                        <Stack spacing={0.75} direction="row" flexWrap="wrap" alignItems="center">
                          <Chip size="small" color="primary" label={selectedAccount.accountTypeLabel} />
                          <Chip size="small" color={selectedAccount.isSystem ? 'warning' : 'default'} label={selectedAccount.isSystem ? <FormattedMessage id="system-account" defaultMessage="حساب نظامي" /> : <FormattedMessage id="active" />} />
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">
                          <FormattedMessage id="not-configured" defaultMessage="غير مضبوط" />
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </MainCard>
      </Stack>
    </Box>
  );
}
