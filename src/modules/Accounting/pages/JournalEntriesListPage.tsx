import { useState } from 'react';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconEye, IconPlus } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';

import { useJournalEntries } from '../hooks/useJournalEntries';
import JournalEntryStatusChip from '../components/JournalEntryStatusChip';
import { JOURNAL_ENTRY_PERMISSIONS, JOURNAL_ENTRY_STATUSES } from '../utils/journal-entry.constants';
import { formatJournalEntrySourceType } from '../utils/journal-entry.format';
import type { JournalEntryListParams } from '../types/journal-entry.types';

export default function JournalEntriesListPage() {
  const intl = useIntl();
  const [searchInput, setSearchInput] = useState('');
  const [params, setParams] = useState<JournalEntryListParams>({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'entryDate',
    sortDirection: 'desc'
  });

  const { items, meta, isLoading } = useJournalEntries(params);

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="journal-entries"
        links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'journal-entries' }]}
      />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="journal-entries" defaultMessage="Journal Entries" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="journal-entries-description"
                defaultMessage="Review and manage manual general ledger journal entries."
              />
            </Typography>
          </Box>
          <PermissionGuard permission={JOURNAL_ENTRY_PERMISSIONS.create}>
            <Button component={Link} to="/accounting/journal-entries/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-journal-entry" defaultMessage="Create journal entry" />
            </Button>
          </PermissionGuard>
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="search" />}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) =>
                  event.key === 'Enter' &&
                  setParams((current) => ({
                    ...current,
                    page: 1,
                    search: searchInput.trim()
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="status" />}
                value={params.status ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, page: 1, status: event.target.value }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" />
                </MenuItem>
                <MenuItem value={JOURNAL_ENTRY_STATUSES.DRAFT}>
                  <FormattedMessage id="journal-entry.status.draft" defaultMessage="Draft" />
                </MenuItem>
                <MenuItem value={JOURNAL_ENTRY_STATUSES.POSTED}>
                  <FormattedMessage id="journal-entry.status.posted" defaultMessage="Posted" />
                </MenuItem>
                <MenuItem value={JOURNAL_ENTRY_STATUSES.CANCELLED}>
                  <FormattedMessage id="journal-entry.status.cancelled" defaultMessage="Cancelled" />
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-from" />}
                value={params.dateFrom ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, page: 1, dateFrom: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-to" />}
                value={params.dateTo ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, page: 1, dateTo: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={() =>
                  setParams((current) => ({
                    ...current,
                    page: 1,
                    search: searchInput.trim()
                  }))
                }
                sx={{ width: '100%' }}
              >
                <FormattedMessage id="search" />
              </Button>
            </Grid>
          </Grid>
        </Card>

        <MainCard contentSX={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="journal-entry-number" defaultMessage="Journal entry number" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="date" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="description" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="total-debit" defaultMessage="Total debit" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="total-credit" defaultMessage="Total credit" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="status" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="source-document-type" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="receipt-payment.source-document-number" defaultMessage="Source Document" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="actions" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton width={90} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={90} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={180} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={64} sx={{ mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      <FormattedMessage id="journal-entries-empty" defaultMessage="No journal entries found." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{getDocumentDisplayNumber(entry.displayNumber, entry.number)}</TableCell>
                    <TableCell>{entry.entryDate}</TableCell>
                    <TableCell>{entry.descriptionArabic || entry.descriptionEnglish || 'â€”'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {entry.totalDebit.toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {entry.totalCredit.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <JournalEntryStatusChip status={entry.status} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                        {entry.isSystemGenerated && (
                          <Chip
                            size="small"
                            color="info"
                            label={<FormattedMessage id="system-generated-entry" defaultMessage="Ù‚ÙŠØ¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ" />}
                          />
                        )}
                        <Typography variant="body2">{formatJournalEntrySourceType(entry.sourceType, intl.locale)}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{getDocumentDisplayNumber(entry.sourceDocumentDisplayNumber, entry.sourceDocumentNumber)}</TableCell>
                    <TableCell align="center">
                      <Button
                        component={Link}
                        to={`/accounting/journal-entries/${entry.id}`}
                        size="small"
                        startIcon={<IconEye size={16} />}
                      >
                        <FormattedMessage id="details" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={meta.totalCount}
            page={meta.page - 1}
            onPageChange={(_, nextPage) => setParams((current) => ({ ...current, page: nextPage + 1 }))}
            rowsPerPage={meta.pageSize}
            onRowsPerPageChange={(event) => setParams((current) => ({ ...current, pageSize: parseInt(event.target.value, 10), page: 1 }))}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </MainCard>
      </Stack>
    </Box>
  );
}
