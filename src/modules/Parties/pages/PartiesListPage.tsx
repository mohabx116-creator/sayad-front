import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconToggleLeft,
  IconToggleRight,
  IconReportMoney,
  IconReceipt,
  IconUsers,
  IconUserCheck
} from '@tabler/icons-react';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import HoverDataCard from 'ui-component/cards/HoverDataCard';
import PartyCashTransactionDialog from '../components/PartyCashTransactionDialog';

import { activateParty, deactivateParty } from '../api/partiesApi';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useParties } from '../hooks/useParties';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';
import { TREASURY_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

type PartyTypeFilter = '' | 'customer' | 'supplier' | 'both';
type StatusFilter = '' | 'true' | 'false';

function getTypeFilterParams(filter: PartyTypeFilter) {
  switch (filter) {
    case 'customer':
      return { isCustomer: true, isSupplier: false };
    case 'supplier':
      return { isCustomer: false, isSupplier: true };
    case 'both':
      return { isCustomer: true, isSupplier: true };
    default:
      return {};
  }
}

export default function PartiesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateParties } = useSWRConfig();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [partyType, setPartyType] = useState<PartyTypeFilter>('customer');
  const [status, setStatus] = useState<StatusFilter>('');
  const [cashDialogParty, setCashDialogParty] = useState<{ id: string; name: string; isCustomer: boolean } | null>(null);

  const {
    items: parties,
    meta,
    isLoading,
    error,
    mutate
  } = useParties({
    page: page + 1,
    pageSize,
    search: search || undefined,
    isActive: status === '' ? undefined : status === 'true',
    ...getTypeFilterParams(partyType)
  });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const toggleStatus = async (partyId: string, nextIsActive: boolean) => {
    try {
      await (nextIsActive ? activateParty(partyId) : deactivateParty(partyId));
      await mutateParties((key) => typeof key === 'string' && key.startsWith('/api/parties'));
      await mutate();
      notify(intl.formatMessage({ id: 'parties-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    }
  };

  const isCustomerList = partyType === 'customer';
  const isSupplierList = partyType === 'supplier';

  const {
    meta: totalMeta,
    isLoading: totalLoading,
    error: totalError
  } = useParties({ page: 1, pageSize: 1, isCustomer: true, isSupplier: false });
  const {
    meta: activeMeta,
    isLoading: activeLoading,
    error: activeError
  } = useParties({ page: 1, pageSize: 1, isCustomer: true, isSupplier: false, isActive: true });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {cashDialogParty && (
        <PartyCashTransactionDialog
          open={!!cashDialogParty}
          mode={cashDialogParty.isCustomer ? 'receipt' : 'payment'}
          partyId={cashDialogParty.id}
          partyName={cashDialogParty.name}
          onClose={() => setCashDialogParty(null)}
          onSaved={() => {
            mutate();
          }}
        />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Breadcrumbs
          custom
          heading={isCustomerList ? 'customers' : 'parties'}
          links={[{ title: isCustomerList ? 'customers' : 'parties' }]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              <FormattedMessage id={isCustomerList ? 'customers' : isSupplierList ? 'suppliers' : 'parties'} />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              <FormattedMessage
                id={
                  isCustomerList ? 'customers-page-description' : isSupplierList ? 'suppliers-page-description' : 'parties-page-description'
                }
              />
            </Typography>
          </Box>
          <PermissionGuard permission={PARTIES_PERMISSIONS.create}>
            <Button component={Link} to="/parties/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id={isCustomerList ? 'create-customer' : 'create-party'} />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          boxShadow: 1
        }}
      >
        <Box sx={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <OutlinedInput
            fullWidth
            placeholder={intl.formatMessage({ id: 'party-search-placeholder' })}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            startAdornment={<IconSearch size={20} style={{ marginInlineEnd: 8, color: '#9e9e9e' }} />}
            sx={{ bgcolor: 'grey.50', borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ width: 200 }}>
          <Select
            fullWidth
            displayEmpty
            value={partyType}
            onChange={(event) => {
              setPartyType(event.target.value as PartyTypeFilter);
              setPage(0);
            }}
            sx={{ bgcolor: 'grey.50', borderRadius: 2 }}
          >
            <MenuItem value="">
              <FormattedMessage id="all" />
            </MenuItem>
            <MenuItem value="customer">
              <FormattedMessage id="party-customer" />
            </MenuItem>
            <MenuItem value="supplier">
              <FormattedMessage id="party-supplier" />
            </MenuItem>
            <MenuItem value="both">
              <FormattedMessage id="party-type-both" />
            </MenuItem>
          </Select>
        </Box>
        <Box sx={{ width: 200 }}>
          <Select
            fullWidth
            displayEmpty
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(0);
            }}
            sx={{ bgcolor: 'grey.50', borderRadius: 2 }}
          >
            <MenuItem value="">
              <FormattedMessage id="all-status" />
            </MenuItem>
            <MenuItem value="true">
              <FormattedMessage id="active" />
            </MenuItem>
            <MenuItem value="false">
              <FormattedMessage id="inactive" />
            </MenuItem>
          </Select>
        </Box>
      </Box>

      {isCustomerList && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {totalLoading ? <Skeleton variant="rounded" height={100} /> : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'total-customers' })}
                primary={totalError ? '-' : totalMeta?.totalCount ?? 0}
                secondary={intl.formatMessage({ id: 'all-statuses' })}
                iconPrimary={GroupIcon}
                color="primary.main"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {activeLoading ? <Skeleton variant="rounded" height={100} /> : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'active-customers' })}
                primary={activeError ? '-' : activeMeta?.totalCount ?? 0}
                secondary={intl.formatMessage({ id: 'active' })}
                iconPrimary={VerifiedUserIcon}
                color="success.main"
              />
            )}
          </Grid>
        </Grid>
      )}

      <Box
        sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 1, overflow: 'hidden' }}
      >
        {isLoading && (
          <Box p={3}>
            <Loader />
          </Box>
        )}
        {error && (
          <Box p={3}>
            <Typography color="error">
              <FormattedMessage id="parties-load-error" />
            </Typography>
          </Box>
        )}
        {!isLoading && parties.length === 0 && (
          <Box p={3}>
            <Typography>
              <FormattedMessage id="parties-empty" />
            </Typography>
          </Box>
        )}
        {parties.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      <FormattedMessage id="party-name" />
                    </TableCell>
                    {!isCustomerList && (
                      <TableCell sx={{ fontWeight: 600, py: 2 }}>
                        <FormattedMessage id="party-classification" />
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      <FormattedMessage id="balance" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      <FormattedMessage id="party-mobile-number" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      <FormattedMessage id="party-address" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      <FormattedMessage id="status" />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                      <FormattedMessage id="actions" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parties.map((party) => (
                    <TableRow
                      hover
                      key={party.id}
                      sx={{
                        opacity: party.isActive ? 1 : 0.65,
                        bgcolor: party.isActive ? 'inherit' : 'grey.50'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        {resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
                      </TableCell>
                      {!isCustomerList && (
                        <TableCell>
                          <PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} />
                        </TableCell>
                      )}
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {formatTreasuryMoney(party.balance, 'ج.م')}
                      </TableCell>
                      <TableCell dir="ltr" sx={{ color: 'text.secondary' }}>
                        {party.primaryPhone ?? '-'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{party.address ?? '-'}</TableCell>
                      <TableCell>
                        <PartyStatusChip isActive={party.isActive} />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={<FormattedMessage id="details" />}>
                            <IconButton component={Link} to={`/parties/${party.id}`} size="small">
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                          <PermissionGuard permission={PARTIES_PERMISSIONS.statementView}>
                            <Tooltip title={<FormattedMessage id="account-statement" />}>
                              <IconButton component={Link} to={`/parties/${party.id}/statement`} size="small">
                                <IconReportMoney size={18} />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          {party.isCustomer && (
                            <PermissionGuard permission={TREASURY_PERMISSIONS.receiptsCreate}>
                              <Tooltip title={<FormattedMessage id="record-receipt" />}>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setCashDialogParty({
                                      id: party.id,
                                      name: resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic),
                                      isCustomer: true
                                    })
                                  }
                                >
                                  <IconReceipt size={18} />
                                </IconButton>
                              </Tooltip>
                            </PermissionGuard>
                          )}
                          <PermissionGuard permission={PARTIES_PERMISSIONS.update}>
                            <Tooltip title={<FormattedMessage id="edit" />}>
                              <IconButton component={Link} to={`/parties/${party.id}/edit`} size="small">
                                <IconEdit size={18} />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={party.isActive ? PARTIES_PERMISSIONS.deactivate : PARTIES_PERMISSIONS.activate}>
                            <Tooltip title={<FormattedMessage id={party.isActive ? 'deactivate' : 'activate'} />}>
                              <IconButton size="small" onClick={() => toggleStatus(party.id, !party.isActive)}>
                                {party.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <TablePagination
                component="div"
                count={meta.totalCount}
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
      </Box>
    </Box>
  );
}
