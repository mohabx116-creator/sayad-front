import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import { IconEdit, IconEye, IconPlus, IconSearch, IconToggleLeft, IconToggleRight, IconReportMoney, IconReceipt, IconTrash } from '@tabler/icons-react';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BalanceIcon from '@mui/icons-material/Balance';

import HoverDataCard from 'ui-component/cards/HoverDataCard';
import CreatePartyDialog from '../components/CreatePartyDialog';
import PartySettlementDialog from '../components/PartySettlementDialog';
import PartyImportWizard from '../components/PartyImportWizard';

import { activateParty, deactivateParty, deleteParty, downloadPartiesImportTemplate, exportPartiesToExcel } from '../api/partiesApi';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ExcelActions } from 'shared/components/excel';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useParties, usePartiesSummary } from '../hooks/useParties';
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function PartiesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateParties } = useSWRConfig();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [partyType, setPartyType] = useState<PartyTypeFilter>('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [cashDialogParty, setCashDialogParty] = useState<{ id: string; name: string; isCustomer: boolean } | null>(null);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!partyToDelete) return;
    try {
      setIsDeleting(true);
      await deleteParty(partyToDelete.id);
      await mutateParties((key) => typeof key === 'string' && key.startsWith('/api/parties'));
      await mutate();
      notify(intl.formatMessage({ id: 'party-delete-success', defaultMessage: 'Customer deleted successfully.' }));
      setPartyToDelete(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportPartiesToExcel();
      downloadBlob(blob, 'parties-export.xlsx');
      dispatch(openSnackbar({ open: true, message: 'تم تصدير الأطراف إلى Excel بنجاح.', variant: 'alert', severity: 'success' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تصدير الأطراف إلى Excel.', 'error');
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadPartiesImportTemplate();
      downloadBlob(blob, 'parties-import-template.xlsx');
      dispatch(openSnackbar({ open: true, message: 'تم تحميل قالب الاستيراد بنجاح.', variant: 'alert', severity: 'success' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    }
  };

  const isCustomerList = partyType === 'customer';
  const isSupplierList = partyType === 'supplier';

  const filterParams = getTypeFilterParams(partyType);

  const {
    meta: totalMeta,
    isLoading: totalLoading,
    error: totalError
  } = useParties({ page: 1, pageSize: 1, ...filterParams });
  const {
    meta: activeMeta,
    isLoading: activeLoading,
    error: activeError
  } = useParties({ page: 1, pageSize: 1, ...filterParams, isActive: true });

  let totalTitleId = 'total-parties';
  let activeTitleId = 'active-parties';
  if (partyType === 'customer') {
    totalTitleId = 'total-customers';
    activeTitleId = 'active-customers';
  } else if (partyType === 'supplier') {
    totalTitleId = 'total-suppliers';
    activeTitleId = 'active-suppliers';
  } else if (partyType === 'both') {
    totalTitleId = 'total-dual-parties';
    activeTitleId = 'active-dual-parties';
  }

  const { summary, isLoading: summaryLoading, error: summaryError } = usePartiesSummary();

  const isDebit = !summaryError && summary?.netNature === 'Debit';
  const isCredit = !summaryError && summary?.netNature === 'Credit';
  const isSettled = !summaryError && summary?.netNature === 'Settled';

  const formatBidiAmount = (value: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  const currencyText = intl.formatMessage({ id: 'currency', defaultMessage: 'ج.م' });

  let netPrimaryDisplay: React.ReactNode = '-';
  let netSecondaryDisplay = intl.formatMessage({ id: 'parties.net-position.error' });
  let netIcon = BalanceIcon;
  let netColor = 'text.secondary';

  if (isDebit || isCredit || isSettled) {
    const stateLabel = isDebit
      ? intl.formatMessage({ id: 'parties.net-position.receivable' })
      : isCredit
      ? intl.formatMessage({ id: 'parties.net-position.payable' })
      : intl.formatMessage({ id: 'parties.net-position.settled' });

    const balanceAmount = isSettled ? 0 : (summary?.netBalance ?? 0);

    netPrimaryDisplay = (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 1,
          flexWrap: 'wrap'
        }}
      >
        <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 700, color: 'inherit' }}>
          {stateLabel}
        </Typography>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 0.5,
            fontSize: 'inherit',
            fontWeight: 700,
            color: 'inherit'
          }}
        >
          <Box
            component="span"
            dir="ltr"
            sx={{
              unicodeBidi: 'isolate',
              display: 'inline-block'
            }}
          >
            {formatBidiAmount(balanceAmount)}
          </Box>
          <Box component="span">
            {currencyText}
          </Box>
        </Box>
      </Box>
    );

    if (isDebit) {
      netSecondaryDisplay = intl.formatMessage({ id: 'parties.net-position.receivable-desc' });
      netIcon = TrendingUpIcon;
      netColor = 'success.main';
    } else if (isCredit) {
      netSecondaryDisplay = intl.formatMessage({ id: 'parties.net-position.payable-desc' });
      netIcon = TrendingDownIcon;
      netColor = 'error.main';
    } else {
      netSecondaryDisplay = intl.formatMessage({ id: 'parties.net-position.settled-desc' });
      netIcon = BalanceIcon;
      netColor = 'text.secondary';
    }
  } else if (!summaryError && summary) {
    netPrimaryDisplay = '-';
    netSecondaryDisplay = intl.formatMessage({ id: 'parties.net-position.unknown', defaultMessage: 'تعذر تحديد الموقف المالي' });
    netIcon = BalanceIcon;
    netColor = 'text.secondary';
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {cashDialogParty && (
        <PartySettlementDialog
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
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
            <ExcelActions
              onExport={handleExport}
              onDownloadTemplate={handleTemplateDownload}
              onImportClick={() => setIsImportWizardOpen(true)}
              exportPermission={PARTIES_PERMISSIONS.view}
              templatePermission={PARTIES_PERMISSIONS.create}
              importPermission={PARTIES_PERMISSIONS.create}
            />
            <PermissionGuard permission={PARTIES_PERMISSIONS.create}>
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="contained" startIcon={<IconPlus size={18} />}>
                <FormattedMessage id={isCustomerList ? 'create-customer' : 'create-party'} />
              </Button>
            </PermissionGuard>
          </Stack>
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

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          {totalLoading ? (
            <Skeleton variant="rounded" height={100} />
          ) : (
            <HoverDataCard
              title={intl.formatMessage({ id: totalTitleId })}
              primary={totalError ? '-' : (totalMeta?.totalCount ?? 0)}
              secondary={intl.formatMessage({ id: 'all-statuses' })}
              iconPrimary={GroupIcon}
              color="primary.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {activeLoading ? (
            <Skeleton variant="rounded" height={100} />
          ) : (
            <HoverDataCard
              title={intl.formatMessage({ id: activeTitleId })}
              primary={activeError ? '-' : (activeMeta?.totalCount ?? 0)}
              secondary={intl.formatMessage({ id: 'active' })}
              iconPrimary={VerifiedUserIcon}
              color="success.main"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {summaryLoading ? (
            <Skeleton variant="rounded" height={100} />
          ) : (
            <Box
              sx={(theme) => ({
                height: '100%',
                '& .MuiCard-root': {
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  ...(isDebit && {
                    borderColor: `${theme.palette.success.light} !important`,
                    border: '1px solid',
                    boxShadow: '0 2px 14px 0 rgba(46, 125, 50, 0.12)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.06)' : 'rgba(46, 125, 50, 0.03)',
                    '&:hover': {
                      boxShadow: '0 4px 20px 0 rgba(46, 125, 50, 0.2) !important'
                    }
                  }),
                  ...(isCredit && {
                    borderColor: `${theme.palette.error.light} !important`,
                    border: '1px solid',
                    boxShadow: '0 2px 14px 0 rgba(211, 47, 47, 0.12)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.06)' : 'rgba(211, 47, 47, 0.03)',
                    '&:hover': {
                      boxShadow: '0 4px 20px 0 rgba(211, 47, 47, 0.2) !important'
                    }
                  }),
                  '& .MuiTypography-h3': {
                    color: isDebit ? 'success.dark' : isCredit ? 'error.main' : 'text.primary',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }
                }
              })}
            >
              <HoverDataCard
                title={intl.formatMessage({ id: 'parties.net-position.title' })}
                primary={netPrimaryDisplay}
                secondary={netSecondaryDisplay}
                iconPrimary={netIcon}
                color={netColor}
              />
            </Box>
          )}
        </Grid>
      </Grid>

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
                          {party.isCustomer && !party.isSupplier && (
                            <PermissionGuard permission={PARTIES_PERMISSIONS.delete}>
                              <Tooltip title={<FormattedMessage id="delete" defaultMessage="Delete" />}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setPartyToDelete({ id: party.id, name: resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic) })}
                                >
                                  <IconTrash size={18} />
                                </IconButton>
                              </Tooltip>
                            </PermissionGuard>
                          )}
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

      <Dialog open={Boolean(partyToDelete)} onClose={isDeleting ? undefined : () => setPartyToDelete(null)} maxWidth="sm" fullWidth>
        <DialogTitle><FormattedMessage id="party-delete-title" defaultMessage="Delete customer" /></DialogTitle>
        <DialogContent>
          <Typography>
            <FormattedMessage
              id="party-delete-confirmation"
              defaultMessage="Are you sure you want to delete {name}? Deletion is allowed only when the customer has no opening balance or linked business history."
              values={{ name: partyToDelete?.name ?? '' }}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartyToDelete(null)} disabled={isDeleting} color="inherit">
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting} color="error" variant="contained" startIcon={<IconTrash size={18} />}>
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </Button>
        </DialogActions>
      </Dialog>

      <CreatePartyDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        initialPartyType={isSupplierList ? 'supplier' : 'customer'}
        onSaved={async () => {
          await mutate();
          await mutateParties((key) => typeof key === 'string' && key.startsWith('/api/parties'));
        }}
      />

      <PartyImportWizard
        open={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImported={async () => {
          await mutate();
          await mutateParties((key) => typeof key === 'string' && key.startsWith('/api/parties'));
        }}
      />
    </Box>
  );
}
