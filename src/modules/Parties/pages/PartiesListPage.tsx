import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEdit, IconEye, IconToggleLeft, IconToggleRight, IconUserPlus } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { activateParty, deactivateParty } from '../api/partiesApi';
import PartyBalance from '../components/PartyBalance';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import { useParties } from '../hooks/useParties';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';

export default function PartiesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [classification, setClassification] = useState('');
  const { items: parties, meta, isLoading, error, mutate } = useParties({
    page: page + 1,
    pageSize,
    search,
    isActive,
    isCustomer: classification === 'customer' ? true : undefined,
    isSupplier: classification === 'supplier' ? true : undefined
  });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await mutate();
      notify(intl.formatMessage({ id: 'parties-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="parties" links={[{ title: 'parties' }]} />
      <MainCard
        title={<FormattedMessage id="parties" />}
        secondary={
          <PermissionGuard permission={PARTIES_PERMISSIONS.create}>
            <Button component={Link} to="/parties/new" variant="contained" startIcon={<IconUserPlus size={18} />}>
              <FormattedMessage id="create-party" />
            </Button>
          </PermissionGuard>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="search" />} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label={<FormattedMessage id="status" />} value={isActive} onChange={(event) => { setIsActive(event.target.value); setPage(0); }}>
              <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
              <MenuItem value="true"><FormattedMessage id="active" /></MenuItem>
              <MenuItem value="false"><FormattedMessage id="inactive" /></MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label={<FormattedMessage id="party-classification" />} value={classification} onChange={(event) => { setClassification(event.target.value); setPage(0); }}>
              <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
              <MenuItem value="customer"><FormattedMessage id="party-customer" /></MenuItem>
              <MenuItem value="supplier"><FormattedMessage id="party-supplier" /></MenuItem>
            </TextField>
          </Grid>
        </Grid>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="parties-load-error" /></Typography>}
        {!isLoading && parties.length === 0 && <Typography><FormattedMessage id="parties-empty" /></Typography>}
        {parties.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="party-code" /></TableCell>
                    <TableCell><FormattedMessage id="name" /></TableCell>
                    <TableCell><FormattedMessage id="party-classification" /></TableCell>
                    <TableCell><FormattedMessage id="phone" /></TableCell>
                    <TableCell><FormattedMessage id="balance" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parties.map((party) => (
                    <TableRow hover key={party.id}>
                      <TableCell>{party.code}</TableCell>
                      <TableCell>{party.nameArabic}</TableCell>
                      <TableCell><PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} /></TableCell>
                      <TableCell>{party.primaryPhone ?? '-'}</TableCell>
                      <TableCell><PartyBalance balance={party.balance} balanceNature={party.balanceNature} /></TableCell>
                      <TableCell><PartyStatusChip isActive={party.isActive} /></TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={<FormattedMessage id="details" />}>
                            <IconButton component={Link} to={`/parties/${party.id}`}><IconEye size={18} /></IconButton>
                          </Tooltip>
                          <PermissionGuard permission={PARTIES_PERMISSIONS.update}>
                            <Tooltip title={<FormattedMessage id="edit" />}>
                              <IconButton component={Link} to={`/parties/${party.id}/edit`}><IconEdit size={18} /></IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={party.isActive ? PARTIES_PERMISSIONS.deactivate : PARTIES_PERMISSIONS.activate}>
                            <Tooltip title={<FormattedMessage id={party.isActive ? 'deactivate' : 'activate'} />}>
                              <IconButton onClick={() => runAction(() => (party.isActive ? deactivateParty(party.id) : activateParty(party.id)))}>
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
            <TablePagination
              component="div"
              count={meta.totalCount}
              page={page}
              rowsPerPage={pageSize}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => { setPageSize(parseInt(event.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </MainCard>
    </>
  );
}
