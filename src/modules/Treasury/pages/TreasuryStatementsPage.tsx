import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import CodeNameLabel from 'shared/components/CodeNameLabel';

import { useParties } from 'modules/Parties/hooks/useParties';
import { useTreasuryAccounts, useTreasuryLookups, useTreasuryStatement } from '../hooks/useTreasury';
import TreasuryMovementTable from '../components/TreasuryMovementTable';
import TreasuryBalanceSummary from '../components/TreasuryBalanceSummary';
import { TREASURY_LOOKUP_PAGE_SIZE } from '../utils/treasury.constants';

export default function TreasuryStatementsPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [treasuryAccountId, setTreasuryAccountId] = useState(searchParams.get('accountId') ?? searchParams.get('treasuryAccountId') ?? '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [movementType, setMovementType] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [partyId, setPartyId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setTreasuryAccountId(searchParams.get('accountId') ?? searchParams.get('treasuryAccountId') ?? '');
    setDateFrom(searchParams.get('dateFrom') ?? '');
    setDateTo(searchParams.get('dateTo') ?? '');
    setMovementType(searchParams.get('movementType') ?? '');
    setReferenceNumber(searchParams.get('referenceNumber') ?? '');
    setPartyId(searchParams.get('partyId') ?? '');
    setPage(1);
  }, [searchParams]);

  const { items: accounts, error: accountsError, mutate: mutateAccounts } = useTreasuryAccounts({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true });
  const { items: parties, error: partiesError, mutate: mutateParties } = useParties({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true, sortBy: 'nameArabic' });
  const { lookups, error: lookupsError, mutate: mutateLookups } = useTreasuryLookups();
  const { statement, isLoading, error } = useTreasuryStatement(
    treasuryAccountId
      ? {
          treasuryAccountId,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          partyId: partyId || undefined,
          referenceNumber: referenceNumber || undefined,
          movementType: movementType || undefined,
          page,
          pageSize: 20
        }
      : null
  );

  useEffect(() => {
    if (!treasuryAccountId && accounts.length > 0) {
      setTreasuryAccountId(accounts[0].id);
    }
  }, [accounts, treasuryAccountId]);

  useEffect(() => {
    setPage(1);
  }, [treasuryAccountId, dateFrom, dateTo, movementType, referenceNumber, partyId]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Breadcrumbs custom heading="statements" links={[{ title: 'treasury', to: '/treasury' }, { title: 'statements' }]} sx={{ mb: 0 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            <FormattedMessage id="treasury.statement-description" defaultMessage="عرض حركات الخزينة بأوصاف عملية وروابط مباشرة للمستندات المرتبطة." />
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/treasury/payments/new"
            variant="outlined"
            color="secondary"
            sx={{
              bgcolor: 'secondary.lighter',
              color: 'secondary.dark',
              borderColor: 'secondary.light',
              '&:hover': { bgcolor: 'secondary.light', borderColor: 'secondary.main' }
            }}
          >
            <FormattedMessage id="create-payment" defaultMessage="سند صرف" />
          </Button>
          <Button
            component={Link}
            to="/treasury/receipts/new"
            variant="contained"
            color="primary"
            sx={{ boxShadow: '0 4px 14px 0 rgba(0, 97, 164, 0.3)' }}
          >
            <FormattedMessage id="create-receipt" defaultMessage="سند قبض" />
          </Button>
        </Box>
      </Box>

      <MainCard
        content={false}
        sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }}
      >
        <Box sx={{ p: 3 }}>
          {(accountsError || partiesError || lookupsError) && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    void Promise.all([mutateAccounts(), mutateParties(), mutateLookups()]);
                  }}
                >
                  <FormattedMessage id="retry" defaultMessage="إعادة المحاولة" />
                </Button>
              }
              sx={{ mb: 3 }}
            >
              <FormattedMessage id="treasury.lookup-load-error" defaultMessage="تعذر تحميل البيانات" />
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}
                value={treasuryAccountId}
                onChange={(event) => setTreasuryAccountId(event.target.value)}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    <CodeNameLabel code={account.code} nameArabic={account.nameArabic} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="party" defaultMessage="العميل / المورد" />}
                value={partyId}
                onChange={(event) => setPartyId(event.target.value)}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" defaultMessage="الكل" />
                </MenuItem>
                {parties.map((party) => (
                  <MenuItem key={party.id} value={party.id}>
                    <CodeNameLabel code={party.code} nameArabic={party.nameArabic} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label={<FormattedMessage id="reference-number" defaultMessage="رقم المرجع" />}
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="movement-type" defaultMessage="نوع الحركة" />}
                value={movementType}
                onChange={(event) => setMovementType(event.target.value)}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" defaultMessage="الكل" />
                </MenuItem>
                {lookups?.movementTypes.map((item) => (
                  <MenuItem key={item.id} value={item.value}>
                    {item.displayName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-from" defaultMessage="من تاريخ" />}
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-to" defaultMessage="إلى تاريخ" />}
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setPage(1);
                }}
              >
                <FormattedMessage id="apply-filters" defaultMessage="تطبيق الفلاتر" />
              </Button>
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      {!treasuryAccountId ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          <FormattedMessage id="treasury.select-account" defaultMessage="اختر حساب خزينة لعرض كشف الحساب." />
        </Typography>
      ) : isLoading ? (
        <Loader />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          <FormattedMessage id="treasury.statement-load-error" defaultMessage="تعذر تحميل كشف الحساب." />
        </Typography>
      ) : statement ? (
        <>
          <TreasuryBalanceSummary
            openingBalance={statement.openingBalance}
            totalReceipts={statement.debitTotal}
            totalPayments={statement.creditTotal}
            netMovement={statement.debitTotal - statement.creditTotal}
            closingBalance={statement.closingBalance}
            currencyCode={statement.currencyCode}
          />

          <MainCard
            content={false}
            sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="text.primary">
                <FormattedMessage id="movement-log" defaultMessage="سجل الحركات" />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="text" color="inherit" title={intl.formatMessage({ id: 'export', defaultMessage: 'تصدير' })} sx={{ minWidth: 'auto', p: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                </Button>
                <Button size="small" variant="text" color="inherit" title={intl.formatMessage({ id: 'print', defaultMessage: 'طباعة' })} sx={{ minWidth: 'auto', p: 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>print</span>
                </Button>
              </Box>
            </Box>
            <Box sx={{ p: 0 }}>
              <TreasuryMovementTable
                movements={statement.movements}
                page={statement.page}
                totalPages={statement.totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
                currencyCode={statement.currencyCode}
              />
            </Box>
          </MainCard>
        </>
      ) : null}
    </Box>
  );
}
