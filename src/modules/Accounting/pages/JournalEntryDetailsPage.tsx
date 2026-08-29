import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { IconArrowLeft, IconCheck, IconEdit, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import JournalEntryCancelDialog from '../components/JournalEntryCancelDialog';
import JournalEntryDeleteDialog from '../components/JournalEntryDeleteDialog';
import JournalEntryStatusChip from '../components/JournalEntryStatusChip';
import { cancelJournalEntry, deleteJournalEntry, postJournalEntry } from '../api/journalEntryApi';
import { useJournalEntry } from '../hooks/useJournalEntries';
import { JOURNAL_ENTRY_PERMISSIONS, JOURNAL_ENTRY_STATUSES } from '../utils/journal-entry.constants';
import { formatJournalEntrySourceType } from '../utils/journal-entry.format';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';

function InfoRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}

function formatLocalizedText(arabic: string | null | undefined, english: string | null | undefined, locale: string) {
  const isArabic = locale.toLowerCase().startsWith('ar');
  const arabicText = arabic?.trim() || '';
  const englishText = english?.trim() || '';
  return isArabic ? arabicText || englishText || '-' : englishText || arabicText || '-';
}

function getLocalizedAccountName(
  line: {
    accountNameArabic?: string | null;
    accountNameEnglish?: string | null;
    accountArabicName?: string | null;
    accountEnglishName?: string | null;
    nameArabic?: string | null;
    nameEnglish?: string | null;
    accountName?: string | null;
    name?: string | null;
  },
  locale: string
): string {
  const arabic = line.accountNameArabic?.trim() || line.accountArabicName?.trim() || line.nameArabic?.trim() || '';
  const english = line.accountNameEnglish?.trim() || line.accountEnglishName?.trim() || line.nameEnglish?.trim() || '';
  const existing = line.accountName?.trim() || line.name?.trim() || '';
  const isArabicLocale = locale.toLowerCase().startsWith('ar');

  return isArabicLocale ? arabic || english || existing || '' : english || arabic || existing || '';
}

function formatLocalizedAccountLabel(
  accountCode: string | null | undefined,
  line: {
    accountNameArabic?: string | null;
    accountNameEnglish?: string | null;
    accountArabicName?: string | null;
    accountEnglishName?: string | null;
    nameArabic?: string | null;
    nameEnglish?: string | null;
    accountName?: string | null;
    name?: string | null;
  },
  locale: string
) {
  const code = accountCode?.trim() || '';
  const name = getLocalizedAccountName(line, locale);
  if (code) {
    return name ? `${code} - ${name}` : code;
  }

  return name || '-';
}

export default function JournalEntryDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { entry, isLoading, mutate } = useJournalEntry(id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canMutate = !entry?.isSystemGenerated;
  const canEdit = canMutate && entry?.status === JOURNAL_ENTRY_STATUSES.DRAFT;
  const canPost = canMutate && entry?.status === JOURNAL_ENTRY_STATUSES.DRAFT;
  const canCancel = canMutate && entry?.status === JOURNAL_ENTRY_STATUSES.POSTED;
  const canDelete = canMutate && entry?.status === JOURNAL_ENTRY_STATUSES.DRAFT;
  const description = formatLocalizedText(entry?.descriptionArabic, entry?.descriptionEnglish, intl.locale);
  const entryDisplayNumber = getDocumentDisplayNumber(entry?.displayNumber, entry?.number);
  const sourceDocumentDisplayNumber = getDocumentDisplayNumber(entry?.sourceDocumentDisplayNumber, entry?.sourceDocumentNumber);

  const handlePost = async () => {
    if (!id || !entry) {
      return;
    }

    setIsProcessing(true);
    try {
      await postJournalEntry(id, entry.rowVersion);
      notify(intl.formatMessage({ id: 'journal-entry-posted-successfully', defaultMessage: 'تم ترحيل القيد اليومي بنجاح.' }));
      await mutate();
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : intl.formatMessage({ id: 'journal-entry-action-failed', defaultMessage: 'تعذر تنفيذ عملية القيد اليومي.' }),
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!id || !entry) {
      return;
    }

    setIsProcessing(true);
    try {
      await cancelJournalEntry(id, { reason, rowVersion: entry.rowVersion });
      notify(intl.formatMessage({ id: 'journal-entry-cancelled-successfully', defaultMessage: 'تم إلغاء القيد اليومي بنجاح.' }));
      await mutate();
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : intl.formatMessage({ id: 'journal-entry-action-failed', defaultMessage: 'تعذر تنفيذ عملية القيد اليومي.' }),
        'error'
      );
    } finally {
      setIsProcessing(false);
      setCancelOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !entry) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteJournalEntry(id, entry.rowVersion);
      notify(intl.formatMessage({ id: 'journal-entry-deleted-successfully', defaultMessage: 'تم حذف القيد اليومي بنجاح.' }));
      await mutate(undefined, { revalidate: false });
      await mutateGlobal(
        (key) => typeof key === 'string' && key.startsWith('/api/accounting/') && key !== `/api/accounting/journal-entries/${id}`
      );
      navigate('/accounting/journal-entries', { replace: true });
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : intl.formatMessage({ id: 'journal-entry-action-failed', defaultMessage: 'تعذر تنفيذ عملية القيد اليومي.' }),
        'error'
      );
    } finally {
      setIsProcessing(false);
      setDeleteOpen(false);
    }
  };

  useEffect(() => {
    if (!entry) {
      return;
    }

    document.title = `${entryDisplayNumber} - ${intl.formatMessage({ id: 'journal-entry-details', defaultMessage: 'Journal Entry Details' })}`;
  }, [entry, entryDisplayNumber, intl]);

  if (isLoading || !entry) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="journal-entry-details"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'journal-entries', to: '/accounting/journal-entries' }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>{entryDisplayNumber}</PageTitle>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              <JournalEntryStatusChip status={entry.status} />
              {entry.isSystemGenerated && (
                <Chip size="small" color="info" label={<FormattedMessage id="system-generated-entry" defaultMessage="قيد تلقائي" />} />
              )}
              <Chip size="small" variant="outlined" label={formatJournalEntrySourceType(entry.sourceType, intl.locale)} />
              {entry.reversalJournalEntryNumber && entry.reversesJournalEntryId && (
                <Button component={Link} to={`/accounting/journal-entries/${entry.reversesJournalEntryId}`} size="small" variant="outlined">
                  {entry.reversalJournalEntryNumber}
                </Button>
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              component={Link}
              to="/accounting/journal-entries"
              variant="outlined"
              color="inherit"
              startIcon={<IconArrowLeft size={18} />}
            >
              <FormattedMessage id="back" />
            </Button>
            {canEdit && (
              <PermissionGuard permission={JOURNAL_ENTRY_PERMISSIONS.update}>
                <Button
                  component={Link}
                  to={`/accounting/journal-entries/${entry.id}/edit`}
                  variant="outlined"
                  startIcon={<IconEdit size={18} />}
                >
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
            )}
            {canPost && (
              <PermissionGuard permission={JOURNAL_ENTRY_PERMISSIONS.post}>
                <Button variant="contained" onClick={handlePost} startIcon={<IconCheck size={18} />} disabled={isProcessing}>
                  <FormattedMessage id="post" />
                </Button>
              </PermissionGuard>
            )}
            {canCancel && (
              <PermissionGuard permission={JOURNAL_ENTRY_PERMISSIONS.cancel}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelOpen(true)}
                  startIcon={<IconX size={18} />}
                  disabled={isProcessing}
                >
                  <FormattedMessage id="cancel-document" defaultMessage="إلغاء المستند" />
                </Button>
              </PermissionGuard>
            )}
            {canDelete && (
              <PermissionGuard permission={JOURNAL_ENTRY_PERMISSIONS.delete}>
                <Button variant="contained" color="error" onClick={() => setDeleteOpen(true)} disabled={isProcessing}>
                  <FormattedMessage id="delete-draft-journal-entry" defaultMessage="حذف المسودة" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <MainCard sx={{ borderRadius: 3, mb: 3 }} content={false}>
              <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight={700}>
                  <FormattedMessage id="basic-information" />
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="journal-entry-number" defaultMessage="رقم القيد اليومي" />}>
                      {entryDisplayNumber}
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="date" />}>{entry.entryDate}</InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="source-document-type" />}>
                      {formatJournalEntrySourceType(entry.sourceType, intl.locale)}
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="receipt-payment.source-document-number" defaultMessage="Source Document" />}>
                      {sourceDocumentDisplayNumber}
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="system-generated-entry" defaultMessage="قيد تلقائي" />}>
                      {entry.isSystemGenerated ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12}>
                    <InfoRow label={<FormattedMessage id="description" />}>{description}</InfoRow>
                  </Grid>
                </Grid>
              </Box>
            </MainCard>

            <MainCard sx={{ borderRadius: 3 }} content={false}>
              <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight={700}>
                  <FormattedMessage id="journal-entry-lines" defaultMessage="سطور القيد اليومي" />
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>
                        <FormattedMessage id="account" defaultMessage="الحساب" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="description" defaultMessage="الوصف" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="debit" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="credit" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entry.lines.map((line) => (
                      <TableRow key={line.id} hover>
                        <TableCell>{line.lineNumber}</TableCell>
                        <TableCell>{formatLocalizedAccountLabel(line.accountCode, line, intl.locale)}</TableCell>
                        <TableCell>{formatLocalizedText(line.descriptionArabic, line.descriptionEnglish, intl.locale)}</TableCell>
                        <TableCell align="right">{line.debitAmount.toFixed(2)}</TableCell>
                        <TableCell align="right">{line.creditAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </MainCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <MainCard sx={{ borderRadius: 3, position: { md: 'sticky' }, top: { md: 24 } }} content={false}>
              <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight={700}>
                  <FormattedMessage id="totals-summary" defaultMessage="ملخص الإجماليات" />
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <InfoRow label={<FormattedMessage id="total-debit" defaultMessage="إجمالي المدين" />}>
                    {entry.totalDebit.toFixed(2)}
                  </InfoRow>
                  <InfoRow label={<FormattedMessage id="total-credit" defaultMessage="إجمالي الدائن" />}>
                    {entry.totalCredit.toFixed(2)}
                  </InfoRow>
                  <Divider />
                  <InfoRow label={<FormattedMessage id="created-date" defaultMessage="تاريخ الإنشاء" />}>{entry.createdAtUtc}</InfoRow>
                  {entry.updatedAtUtc && (
                    <InfoRow label={<FormattedMessage id="updated-at" defaultMessage="تاريخ التعديل" />}>{entry.updatedAtUtc}</InfoRow>
                  )}
                  {entry.postedAtUtc && (
                    <InfoRow label={<FormattedMessage id="posted-at" defaultMessage="تاريخ الترحيل" />}>{entry.postedAtUtc}</InfoRow>
                  )}
                  {entry.cancelledAtUtc && (
                    <InfoRow label={<FormattedMessage id="cancelled-at" defaultMessage="تاريخ الإلغاء" />}>{entry.cancelledAtUtc}</InfoRow>
                  )}
                  {entry.cancellationReason && (
                    <InfoRow label={<FormattedMessage id="cancellation-reason" defaultMessage="سبب الإلغاء" />}>
                      {entry.cancellationReason}
                    </InfoRow>
                  )}
                </Stack>
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      </Stack>

      <JournalEntryCancelDialog
        open={cancelOpen}
        isProcessing={isProcessing}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
      <JournalEntryDeleteDialog
        open={deleteOpen}
        isProcessing={isProcessing}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
