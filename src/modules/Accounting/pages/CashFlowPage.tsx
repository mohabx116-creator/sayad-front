import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowRight, IconCash, IconRefresh } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useCashFlowReport } from '../hooks/useAccountingReports';
import type { CashFlowParams, CashFlowRowDto, CashFlowSectionDto } from '../types/report.types';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildGeneralLedgerUrl(accountId: string, fromDate: string, toDate: string) {
  const query = new URLSearchParams({
    accountId,
    fromDate,
    toDate
  });

  return `/accounting/reports/general-ledger?${query.toString()}`;
}

export default function CashFlowPage() {
  const intl = useIntl();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const firstDay = useMemo(() => formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), []);
  const [params, setParams] = useState<CashFlowParams>({
    fromDate: firstDay,
    toDate: today,
    includeZeroRows: false,
    includeInactiveAccounts: false,
    search: ''
  });

  const reportParams = useMemo(
    () => ({
      ...params,
      search: params.search?.trim() || undefined
    }),
    [params]
  );
  const { report, error, isLoading, mutate } = useCashFlowReport(reportParams);

  const renderRows = (rows: CashFlowRowDto[]) => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton width={90} /></TableCell>
          <TableCell><Skeleton width={240} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={50} sx={{ mx: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
        </TableRow>
      ));
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              <FormattedMessage id="cash-flow-empty-section" defaultMessage="No cash-flow rows matched this section." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row) => (
      <TableRow key={row.accountId ?? `${row.cashFlowActivityType}-${row.accountArabicName}`} hover sx={{ bgcolor: row.isDataIntegrityAdjustment ? 'warning.lighter' : undefined }}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.accountCode || '-'}</TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.accountArabicName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.accountEnglishName || row.cashFlowActivityTypeLabel}
            </Typography>
            {row.isDataIntegrityAdjustment && (
              <Chip size="small" color="warning" variant="outlined" label={<FormattedMessage id="cash-flow-integrity-adjustment" defaultMessage="Integrity adjustment" />} />
            )}
          </Stack>
        </TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.inflowAmount)}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.outflowAmount)}</TableCell>
        <TableCell align="right">
          <Typography fontWeight={700} color={row.netAmount < 0 ? 'error.main' : 'success.main'}>
            {formatAmount(intl.locale, row.netAmount)}
          </Typography>
        </TableCell>
        <TableCell align="center">{row.movementCount}</TableCell>
        <TableCell align="center">
          {row.accountId && !row.isDataIntegrityAdjustment ? (
            <Button
              component={Link}
              to={buildGeneralLedgerUrl(row.accountId, report?.fromDate ?? params.fromDate ?? firstDay, report?.toDate ?? params.toDate ?? today)}
              size="small"
              variant="outlined"
              startIcon={<IconArrowRight size={16} />}
            >
              <FormattedMessage id="view-general-ledger" defaultMessage="View general ledger" />
            </Button>
          ) : (
            '-'
          )}
        </TableCell>
      </TableRow>
    ));
  };

  const renderSection = (titleId: string, defaultTitle: string, section: CashFlowSectionDto) => (
    <MainCard
      title={
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <IconCash size={18} />
            <Typography variant="h6" component="span">
              <FormattedMessage id={titleId} defaultMessage={defaultTitle} />
            </Typography>
            <Chip size="small" variant="outlined" label={section.rows.length.toString()} />
          </Stack>
          <Typography variant="subtitle1" fontWeight={800}>
            {formatAmount(intl.locale, section.netCashFlow)}
          </Typography>
        </Stack>
      }
      contentSX={{ p: 0 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><FormattedMessage id="account-code" defaultMessage="Account code" /></TableCell>
            <TableCell><FormattedMessage id="account" defaultMessage="Account" /></TableCell>
            <TableCell align="right"><FormattedMessage id="cash-flow-inflows" defaultMessage="Inflows" /></TableCell>
            <TableCell align="right"><FormattedMessage id="cash-flow-outflows" defaultMessage="Outflows" /></TableCell>
            <TableCell align="right"><FormattedMessage id="cash-flow-net" defaultMessage="Net cash flow" /></TableCell>
            <TableCell align="center"><FormattedMessage id="movement-count" defaultMessage="Movements" /></TableCell>
            <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderRows(section.rows)}</TableBody>
      </Table>
    </MainCard>
  );

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="cash-flow-report"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'cash-flow-report' }
        ]}
      />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="cash-flow-report" defaultMessage="Cash Flow Statement" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage id="cash-flow-report-description" defaultMessage="Direct-method cash flow from mapped treasury cash accounts and explicitly classified counterpart accounts." />
            </Typography>
          </Box>
          {report && (
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              <Chip
                color={report.isReconciled ? 'success' : 'error'}
                variant="outlined"
                label={report.isReconciled ? intl.formatMessage({ id: 'cash-flow-reconciled', defaultMessage: 'Reconciled' }) : intl.formatMessage({ id: 'cash-flow-not-reconciled', defaultMessage: 'Not reconciled' })}
              />
              <Chip variant="outlined" label={`${intl.formatMessage({ id: 'cash-account-count', defaultMessage: 'Cash accounts' })}: ${report.cashAccountCount}`} />
            </Stack>
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.4}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date-from" defaultMessage="From date" />} value={params.fromDate ?? ''} onChange={(event) => setParams((current) => ({ ...current, fromDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date-to" defaultMessage="To date" />} value={params.toDate ?? ''} onChange={(event) => setParams((current) => ({ ...current, toDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField fullWidth label={<FormattedMessage id="search" defaultMessage="Search" />} value={params.search ?? ''} onChange={(event) => setParams((current) => ({ ...current, search: event.target.value }))} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel control={<Switch checked={params.includeZeroRows ?? false} onChange={(event) => setParams((current) => ({ ...current, includeZeroRows: event.target.checked }))} />} label={<FormattedMessage id="include-zero-rows" defaultMessage="Include zero rows" />} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <FormControlLabel control={<Switch checked={params.includeInactiveAccounts ?? false} onChange={(event) => setParams((current) => ({ ...current, includeInactiveAccounts: event.target.checked }))} />} label={<FormattedMessage id="include-inactive-accounts" defaultMessage="Include inactive" />} />
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert severity="error" action={<Button color="inherit" size="small" startIcon={<IconRefresh size={16} />} onClick={() => mutate()}><FormattedMessage id="retry" defaultMessage="Retry" /></Button>}>
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'cash-flow-load-error', defaultMessage: 'Unable to load the Cash Flow Statement.' })}
          </Alert>
        )}

        {report && (
          <>
            <Grid container spacing={2}>
              {[
                { id: 'opening-cash-balance', defaultMessage: 'Opening cash balance', value: report.openingCashBalance },
                { id: 'operating-net-cash-flow', defaultMessage: 'Operating net cash flow', value: report.operatingNetCashFlow },
                { id: 'investing-net-cash-flow', defaultMessage: 'Investing net cash flow', value: report.investingNetCashFlow },
                { id: 'financing-net-cash-flow', defaultMessage: 'Financing net cash flow', value: report.financingNetCashFlow },
                { id: 'net-increase-decrease-in-cash', defaultMessage: 'Net increase/decrease in cash', value: report.netIncreaseDecreaseInCash },
                { id: 'closing-cash-balance', defaultMessage: 'Closing cash balance', value: report.closingCashBalance },
                { id: 'reconciliation-difference', defaultMessage: 'Reconciliation difference', value: report.reconciliationDifference },
                { id: 'internal-transfer-count', defaultMessage: 'Internal transfers', value: report.internalTransferCount, isCount: true }
              ].map(({ id, defaultMessage, value, isCount }) => (
                <Grid item xs={12} md={3} key={id}>
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="overline" color="text.secondary">
                      <FormattedMessage id={id} defaultMessage={defaultMessage} />
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {isCount ? value : formatAmount(intl.locale, value)}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {report.isReconciled ? (
              <Alert severity="success">
                <FormattedMessage id="cash-flow-reconciled-message" defaultMessage="Cash movement reconciles to the closing cash balance." />
              </Alert>
            ) : (
              <Alert severity="warning">
                <FormattedMessage id="cash-flow-not-reconciled-message" defaultMessage="Cash movement does not reconcile to the closing cash balance." />
              </Alert>
            )}

            {report.hasUnclassifiedActivity && (
              <Alert severity="warning">
                <FormattedMessage id="cash-flow-unclassified-warning" defaultMessage="Unclassified counterpart cash movement is visible and included in reconciliation." />
              </Alert>
            )}

            {report.hasDataIntegrityWarnings && (
              <Alert severity="warning">
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    <FormattedMessage id="cash-flow-integrity-warning" defaultMessage="One or more entries required an unclassified integrity adjustment." />
                  </Typography>
                  {report.dataIntegrityWarnings.slice(0, 3).map((warning) => (
                    <Typography key={warning} variant="caption">
                      {warning}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}

            {!report.hasActivity && (
              <Alert severity="info">
                <FormattedMessage id="cash-flow-empty-period" defaultMessage="No cash flows exist during the selected period." />
              </Alert>
            )}

            {renderSection('cash-flow-operating-section', 'Cash flows from operating activities', report.operatingSection)}
            {renderSection('cash-flow-investing-section', 'Cash flows from investing activities', report.investingSection)}
            {renderSection('cash-flow-financing-section', 'Cash flows from financing activities', report.financingSection)}
            {(report.excludedSection.rows.length > 0 || params.includeZeroRows) && renderSection('cash-flow-excluded-section', 'Excluded movements', report.excludedSection)}
            {(report.unclassifiedSection.rows.length > 0 || params.includeZeroRows) && renderSection('cash-flow-unclassified-section', 'Unclassified movements', report.unclassifiedSection)}
          </>
        )}
      </Stack>
    </Box>
  );
}
