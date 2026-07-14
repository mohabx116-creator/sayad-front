import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import { useTreasuryAccounts, useTreasuryLookups, useTreasuryStatement } from '../hooks/useTreasury';
import TreasuryMovementTable from '../components/TreasuryMovementTable';

export default function TreasuryStatementsPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [treasuryAccountId, setTreasuryAccountId] = useState(searchParams.get('accountId') ?? searchParams.get('treasuryAccountId') ?? '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [movementType, setMovementType] = useState('');
  const [page, setPage] = useState(1);

  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: 200, status: 'Active' });
  const { lookups } = useTreasuryLookups();
  const { statement, isLoading, error } = useTreasuryStatement(
    treasuryAccountId
      ? {
          treasuryAccountId,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
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
  }, [treasuryAccountId, dateFrom, dateTo, movementType]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Breadcrumbs
            custom
            heading="statements"
            links={[{ title: 'treasury', to: '/treasury' }, { title: 'statements' }]}
            sx={{ mb: 0 }}
          />
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
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_upward</span>}
          >
            <FormattedMessage id="create-payment" defaultMessage="سند صرف" />
          </Button>
          <Button
            component={Link}
            to="/treasury/receipts/new"
            variant="contained"
            color="primary"
            sx={{ boxShadow: '0 4px 14px 0 rgba(0, 97, 164, 0.3)' }}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_downward</span>}
          >
            <FormattedMessage id="create-receipt" defaultMessage="سند قبض" />
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Current Balance Card (MD3 Style) */}
        <Grid item xs={12} md={4}>
          <MainCard
            content={false}
            sx={{
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ position: 'absolute', top: -40, left: -40, width: 128, height: 128, bgcolor: 'primary.light', opacity: 0.2, borderRadius: '50%', filter: 'blur(30px)' }} />

            <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--mui-palette-primary-main)' }}>account_balance</span>
                <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h1" fontWeight={700} color="text.primary">
                  {statement ? statement.closingBalance.toLocaleString() : '0.00'}
                </Typography>
                <Typography variant="h4" color="text.secondary" fontWeight={400}>
                  {statement ? statement.currencyCode : ''}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage id="last-updated" defaultMessage="آخر تحديث: الآن" />
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'success.lighter', color: 'success.dark', px: 1, py: 0.25, borderRadius: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                <Typography variant="caption" fontWeight={600}>نشط</Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        {/* Filters Area */}
        <Grid item xs={12} md={8}>
          <MainCard
            content={false}
            sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth label={<FormattedMessage id="treasury-account" defaultMessage="الحساب" />} value={treasuryAccountId} onChange={(event) => setTreasuryAccountId(event.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.code} - {account.nameArabic}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField type="date" fullWidth label={<FormattedMessage id="date-from" />} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField type="date" fullWidth label={<FormattedMessage id="date-to" />} value={dateTo} onChange={(event) => setDateTo(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField select fullWidth label={<FormattedMessage id="movement-type" />} value={movementType} onChange={(event) => setMovementType(event.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                    {lookups?.movementTypes.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{item.labelArabic}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {!treasuryAccountId ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          <FormattedMessage id="treasury.select-account" defaultMessage="اختر حساب خزينة لعرض الكشف." />
        </Typography>
      ) : isLoading ? (
        <Loader />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          <FormattedMessage id="treasury.statement-load-error" defaultMessage="تعذر تحميل كشف الحساب." />
        </Typography>
      ) : statement ? (
        <MainCard
          content={false}
          sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}
        >
          {/* Table Header matching Stitch */}
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
      ) : null}
    </Box>
  );
}
