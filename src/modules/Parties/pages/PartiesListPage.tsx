import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEdit, IconEye, IconToggleLeft, IconToggleRight, IconPlus, IconDownload, IconSearch, IconTrash } from '@tabler/icons-react';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { activateParty, deactivateParty, finalDeleteParty } from '../api/partiesApi';
import PartyBalance from '../components/PartyBalance';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyFinalDeleteDialog from '../components/PartyFinalDeleteDialog';
import PartyStatusChip from '../components/PartyStatusChip';
import { usePartyDeletionPreview, useParties } from '../hooks/useParties';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';

export default function PartiesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateParties } = useSWRConfig();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [classification, setClassification] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { items: parties, meta, isLoading, error, mutate } = useParties({
    page: page + 1,
    pageSize,
    search,
    isActive,
    isCustomer: classification === 'customer' ? true : undefined,
    isSupplier: classification === 'supplier' ? true : undefined
  });
  const { preview: deletionPreview, isLoading: isDeletionPreviewLoading, error: deletionPreviewError } = usePartyDeletionPreview(deleteTarget?.id, deleteDialogOpen);

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

  const handleDeleteConfirm = async (request: { code: string; reason: string; rowVersion: string }) => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await finalDeleteParty(deleteTarget.id, request);
      await mutateParties((key) => typeof key === 'string' && key.startsWith('/api/parties'));
      await mutate();
      notify('تم حذف الطرف نهائيًا بنجاح.');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Breadcrumbs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Breadcrumbs custom heading="parties" links={[{ title: 'parties' }]} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              <FormattedMessage id="parties" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              إدارة العملاء والموردين
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button variant="contained" color="inherit" sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1, '&:hover': { bgcolor: 'grey.100' } }} startIcon={<IconDownload size={18} />}>
              تصدير
            </Button>
            <PermissionGuard permission={PARTIES_PERMISSIONS.create}>
              <Button component={Link} to="/parties/new" variant="contained" color="primary" startIcon={<IconPlus size={18} />}>
                <FormattedMessage id="create-party" />
              </Button>
            </PermissionGuard>
          </Box>
        </Box>
      </Box>

      {/* Filters Area */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', boxShadow: 1 }}>
        <Box sx={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <OutlinedInput
            fullWidth
            placeholder="البحث بالاسم، الكود، أو الهاتف..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            startAdornment={<IconSearch size={20} style={{ marginRight: 8, color: '#9e9e9e' }} />}
            sx={{ bgcolor: 'grey.50', borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ width: 192 }}>
          <Select
            fullWidth
            displayEmpty
            value={classification}
            onChange={(e) => { setClassification(e.target.value); setPage(0); }}
            sx={{ bgcolor: 'grey.50', borderRadius: 2 }}
          >
            <MenuItem value="">كل الأنواع</MenuItem>
            <MenuItem value="customer"><FormattedMessage id="party-customer" /></MenuItem>
            <MenuItem value="supplier"><FormattedMessage id="party-supplier" /></MenuItem>
          </Select>
        </Box>
        <Box sx={{ width: 192 }}>
          <Select
            fullWidth
            displayEmpty
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(0); }}
            sx={{ bgcolor: 'grey.50', borderRadius: 2 }}
          >
            <MenuItem value="">كل الحالات</MenuItem>
            <MenuItem value="true"><FormattedMessage id="active" /></MenuItem>
            <MenuItem value="false"><FormattedMessage id="inactive" /></MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Data Table Card */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading && <Box p={3}><Loader /></Box>}
        {error && <Box p={3}><Typography color="error"><FormattedMessage id="parties-load-error" /></Typography></Box>}
        {!isLoading && parties.length === 0 && <Box p={3}><Typography><FormattedMessage id="parties-empty" /></Typography></Box>}
        {parties.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="party-code" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="name" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="party-classification" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="phone" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="balance" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="status" /></TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parties.map((party) => (
                    <TableRow
                      hover
                      key={party.id}
                      sx={{
                        '&:hover .row-actions': { opacity: 1 },
                        opacity: party.isActive ? 1 : 0.6,
                        bgcolor: party.isActive ? 'inherit' : 'grey.50'
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{party.code}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{party.nameArabic}</TableCell>
                      <TableCell><PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} /></TableCell>
                      <TableCell sx={{ color: 'text.secondary' }} dir="ltr">{party.primaryPhone ?? '-'}</TableCell>
                      <TableCell><PartyBalance balance={party.balance} balanceNature={party.balanceNature} /></TableCell>
                      <TableCell><PartyStatusChip isActive={party.isActive} /></TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" className="row-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                          <PermissionGuard permission={PARTIES_PERMISSIONS.update}>
                            <Tooltip title={<FormattedMessage id="edit" />}>
                              <IconButton size="small" component={Link} to={`/parties/${party.id}/edit`} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: '#d1e4ff' } }}>
                                <IconEdit size={18} />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={party.isActive ? PARTIES_PERMISSIONS.deactivate : PARTIES_PERMISSIONS.activate}>
                            <Tooltip title={<FormattedMessage id={party.isActive ? 'deactivate' : 'activate'} />}>
                              <IconButton size="small" onClick={() => runAction(() => (party.isActive ? deactivateParty(party.id) : activateParty(party.id)))} sx={{ color: 'text.secondary', '&:hover': { color: party.isActive ? 'error.main' : 'success.main', bgcolor: party.isActive ? '#ffdad6' : '#c8e6c9' } }}>
                                {party.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          {user?.isSystemOwner && (
                            <Tooltip title="حذف نهائي">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteTarget({ id: party.id, code: party.code });
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: '#ffdad6' } }}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={<FormattedMessage id="details" />}>
                            <IconButton size="small" component={Link} to={`/parties/${party.id}`} sx={{ color: 'text.secondary', '&:hover': { color: 'secondary.main', bgcolor: '#ebddff' } }}>
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
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
                onRowsPerPageChange={(event) => { setPageSize(parseInt(event.target.value, 10)); setPage(0); }}
                labelRowsPerPage=""
              />
            </Box>
          </>
        )}
      </Box>

      <PartyFinalDeleteDialog
        open={deleteDialogOpen}
        isLoading={isDeletionPreviewLoading}
        isProcessing={isDeleting}
        preview={deletionPreview}
        errorMessage={deletionPreviewError instanceof Error ? deletionPreviewError.message : null}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
