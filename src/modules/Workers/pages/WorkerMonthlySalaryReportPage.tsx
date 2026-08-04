import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconEye, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import { useWorkerMonthlySalaryReport } from '../hooks/useWorkers';
import type { WorkerMonthlySalaryReportParams } from '../types/workers.types';

const PAGE_SIZE = 20;

function formatMoney(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

function monthLabel(locale: string, month: number) {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, month - 1, 1));
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Stack spacing={0.75}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          {value}
        </Typography>
      </Stack>
    </Card>
  );
}

export default function WorkerMonthlySalaryReportPage() {
  const intl = useIntl();
  const today = new Date();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const reportParams = useMemo<WorkerMonthlySalaryReportParams>(
    () => ({
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      paymentStatus,
      search: search || undefined,
      page: page + 1,
      pageSize
    }),
    [month, page, pageSize, paymentStatus, search, year]
  );

  const { report, error, isLoading } = useWorkerMonthlySalaryReport(reportParams);

  const monthName = month ? monthLabel(intl.locale, Number(month)) : '-';

  const summaryCards = useMemo(() => {
    if (!report) {
      return [
        { label: intl.formatMessage({ id: 'salary-report-total-workers' }), value: 0 },
        { label: intl.formatMessage({ id: 'salary-report-total-base-salaries' }), value: formatMoney(intl.locale, 0) },
        { label: intl.formatMessage({ id: 'salary-report-total-additions' }), value: formatMoney(intl.locale, 0) },
        { label: intl.formatMessage({ id: 'salary-report-total-deductions' }), value: formatMoney(intl.locale, 0) },
        { label: intl.formatMessage({ id: 'salary-report-total-net-salaries' }), value: formatMoney(intl.locale, 0) },
        { label: intl.formatMessage({ id: 'salary-report-total-paid' }), value: formatMoney(intl.locale, 0) },
        { label: intl.formatMessage({ id: 'salary-report-total-unpaid' }), value: formatMoney(intl.locale, 0) }
      ];
    }

    return [
      { label: intl.formatMessage({ id: 'salary-report-total-workers' }), value: report.workersCount },
      { label: intl.formatMessage({ id: 'salary-report-total-base-salaries' }), value: formatMoney(intl.locale, report.totalBaseSalaries) },
      { label: intl.formatMessage({ id: 'salary-report-total-additions' }), value: formatMoney(intl.locale, report.totalAdditions) },
      { label: intl.formatMessage({ id: 'salary-report-total-deductions' }), value: formatMoney(intl.locale, report.totalDeductions) },
      { label: intl.formatMessage({ id: 'salary-report-total-net-salaries' }), value: formatMoney(intl.locale, report.totalNetSalaries) },
      { label: intl.formatMessage({ id: 'salary-report-total-paid' }), value: formatMoney(intl.locale, report.totalPaid) },
      { label: intl.formatMessage({ id: 'salary-report-total-unpaid' }), value: formatMoney(intl.locale, report.totalUnpaid) }
    ];
  }, [intl, report]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs
        custom
        heading="salary-report"
        links={[{ title: 'workers', to: '/labor/workers' }, { title: 'salary-report' }]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            <FormattedMessage id="salary-report" />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            <FormattedMessage id="salary-report-page-description" />
          </Typography>
        </Box>
        <Button component={Link} to="/labor/workers" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
          <FormattedMessage id="back" />
        </Button>
      </Box>

      <Grid container spacing={2}>
        {summaryCards.map((card) => (
          <Grid key={card.label} item xs={12} sm={6} md={4} lg={3}>
            <SummaryCard label={card.label} value={card.value} />
          </Grid>
        ))}
      </Grid>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <OutlinedInput
            fullWidth
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'salary-report-search-placeholder' })}
            startAdornment={<IconSearch size={18} style={{ marginInlineEnd: 8, opacity: 0.7 }} />}
          />
          <Select
            fullWidth
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((monthValue) => (
              <MenuItem key={monthValue} value={String(monthValue)}>
                {monthValue} - {monthLabel(intl.locale, monthValue)}
              </MenuItem>
            ))}
          </Select>
          <OutlinedInput
            fullWidth
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'salary-report-year-placeholder' })}
            inputProps={{ inputMode: 'numeric', dir: 'ltr' }}
          />
          <Select
            fullWidth
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value as 'all' | 'paid' | 'unpaid');
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value="all"><FormattedMessage id="all" /></MenuItem>
            <MenuItem value="paid"><FormattedMessage id="paid" /></MenuItem>
            <MenuItem value="unpaid"><FormattedMessage id="unpaid" /></MenuItem>
          </Select>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary">
              {monthName} {year}
            </Typography>
          </Box>
        </Box>

        {isLoading && (
          <Box sx={{ py: 6 }}>
            <Loader />
          </Box>
        )}

        {error && !isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 1 }}>
              <FormattedMessage id="salary-report-load-error" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error instanceof Error ? error.message : ''}
            </Typography>
          </Box>
        )}

        {!isLoading && !error && (report?.rows.length ?? 0) === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="salary-report-empty" />
            </Typography>
          </Box>
        )}

        {!isLoading && !error && report && report.rows.length > 0 && (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1600 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="worker-name" /></TableCell>
                    <TableCell><FormattedMessage id="worker-operational-job" /></TableCell>
                    <TableCell><FormattedMessage id="month" /></TableCell>
                    <TableCell><FormattedMessage id="salary-report-base-salary" /></TableCell>

                    <TableCell><FormattedMessage id="salary-report-overtime" /></TableCell>
                    <TableCell><FormattedMessage id="bonuses" /></TableCell>
                    <TableCell><FormattedMessage id="salary-report-absence-deduction" /></TableCell>
                    <TableCell><FormattedMessage id="salary-report-other-deductions" /></TableCell>
                    <TableCell><FormattedMessage id="total-additions" /></TableCell>
                    <TableCell><FormattedMessage id="deductions" /></TableCell>
                    <TableCell><FormattedMessage id="net-salary" /></TableCell>
                    <TableCell><FormattedMessage id="salary-status" /></TableCell>
                    <TableCell><FormattedMessage id="payment-date" /></TableCell>
                    <TableCell><FormattedMessage id="cashbox" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.rows.map((row) => (
                    <TableRow key={row.id} hover sx={{ opacity: row.isPaid ? 1 : 0.78 }}>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" fontWeight={600}>{row.workerName}</Typography>
                          <Typography variant="caption" color="text.secondary" dir="ltr">
                            {row.workerCode}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.operationalJobName}</TableCell>
                      <TableCell dir="ltr">{row.monthLabel}</TableCell>
                      <TableCell dir="ltr">{formatMoney(intl.locale, row.baseSalary)}</TableCell>

                      <TableCell dir="ltr">{formatMoney(intl.locale, row.overtime)}</TableCell>
                      <TableCell dir="ltr">{formatMoney(intl.locale, row.bonuses)}</TableCell>
                      <TableCell dir="ltr">{formatMoney(intl.locale, row.absenceDeduction)}</TableCell>
                      <TableCell dir="ltr">{formatMoney(intl.locale, row.otherDeductions)}</TableCell>
                      <TableCell dir="ltr">{formatMoney(intl.locale, row.totalAdditions)}</TableCell>
                      <TableCell dir="ltr">{formatMoney(intl.locale, row.totalDeductions)}</TableCell>
                      <TableCell dir="ltr" sx={{ fontWeight: 700 }}>
                        {formatMoney(intl.locale, row.netSalary)}
                      </TableCell>
                      <TableCell><FormattedMessage id={row.isPaid ? 'paid' : 'unpaid'} /></TableCell>
                      <TableCell dir="ltr">{formatDate(intl.locale, row.paymentDate)}</TableCell>
                      <TableCell>{row.treasuryAccountNameArabic ?? row.treasuryAccountCode ?? '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          component={Link}
                          to={`/labor/workers/${row.workerId}?salaryId=${row.id}`}
                          size="small"
                          aria-label={intl.formatMessage({ id: 'view' })}
                        >
                          <IconEye size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <TablePagination
                component="div"
                count={report.totalCount}
                page={page}
                rowsPerPage={pageSize}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setPageSize(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage=""
              />
            </Box>
          </>
        )}
      </MainCard>
    </Box>
  );
}
