import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
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

import { Link } from 'react-router-dom';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { activateParty, createParty, deactivateParty, updateParty } from '../api/partiesApi';
import PartyBalance from '../components/PartyBalance';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import { useParties } from '../hooks/useParties';
import { createPartySchema, updatePartySchema } from '../schemas/party.schema';
import type { CreatePartyRequest, PartyDto, UpdatePartyRequest } from '../types/parties.types';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';

type PartyDialogState = { mode: 'create' | 'edit'; party?: PartyDto } | null;

const emptyCreateValues: CreatePartyRequest = {
  nameArabic: '',
  nameEnglish: '',
  isCustomer: true,
  isSupplier: false,
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  address: '',
  notes: '',
  openingBalance: {
    entryDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    balanceNature: '',
    notes: ''
  }
};

export default function PartiesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [classification, setClassification] = useState('');
  const [dialog, setDialog] = useState<PartyDialogState>(null);
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
            <Button variant="contained" startIcon={<IconUserPlus size={18} />} onClick={() => setDialog({ mode: 'create' })}>
              <FormattedMessage id="create-party" />
            </Button>
          </PermissionGuard>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="search" />} value={search} onChange={(event) => setSearch(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label={<FormattedMessage id="status" />} value={isActive} onChange={(event) => setIsActive(event.target.value)}>
              <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
              <MenuItem value="true"><FormattedMessage id="active" /></MenuItem>
              <MenuItem value="false"><FormattedMessage id="inactive" /></MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label={<FormattedMessage id="party-classification" />} value={classification} onChange={(event) => setClassification(event.target.value)}>
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
                              <IconButton onClick={() => setDialog({ mode: 'edit', party })}><IconEdit size={18} /></IconButton>
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
      {dialog && (
        <PartyDialog
          dialog={dialog}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            mutate();
            notify(intl.formatMessage({ id: 'parties-action-success' }));
          }}
        />
      )}
    </>
  );
}

function PartyDialog({ dialog, onClose, onSaved }: { dialog: PartyDialogState; onClose: () => void; onSaved: () => void }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const createForm = useForm<CreatePartyRequest>({ resolver: zodResolver(createPartySchema), values: emptyCreateValues });
  const updateForm = useForm<UpdatePartyRequest>({
    resolver: zodResolver(updatePartySchema),
    values: {
      nameArabic: dialog?.party?.nameArabic ?? '',
      nameEnglish: dialog?.party?.nameEnglish ?? '',
      isCustomer: dialog?.party?.isCustomer ?? true,
      isSupplier: dialog?.party?.isSupplier ?? false,
      primaryPhone: dialog?.party?.primaryPhone ?? '',
      secondaryPhone: dialog?.party?.secondaryPhone ?? '',
      email: dialog?.party?.email ?? '',
      address: dialog?.party?.address ?? '',
      notes: dialog?.party?.notes ?? '',
      rowVersion: dialog?.party?.rowVersion ?? ''
    }
  });
  const form = dialog?.mode === 'create' ? createForm : updateForm;
  const activeControl = form.control as any;

  const notifyError = (error: unknown) => {
    dispatch(openSnackbar({ open: true, message: error instanceof Error ? error.message : intl.formatMessage({ id: 'parties-action-failed' }), variant: 'alert', severity: 'error' }));
  };

  const persist = async (action: () => Promise<unknown>) => {
    try {
      setIsSaving(true);
      await action();
      onSaved();
    } catch (error) {
      notifyError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const save = () => {
    if (!dialog) return;
    if (dialog.mode === 'create') void createForm.handleSubmit((values) => persist(() => createParty(cleanCreate(values))))();
    if (dialog.mode === 'edit' && dialog.party) void updateForm.handleSubmit((values) => persist(() => updateParty(dialog.party!.id, cleanUpdate(values))))();
  };

  return (
    <Dialog open onClose={isSaving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle><FormattedMessage id={dialog?.mode === 'create' ? 'create-party' : 'edit-party'} /></DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <Controller name="nameArabic" control={activeControl} render={({ field, fieldState }) => <TextField {...field} fullWidth label={<FormattedMessage id="name-arabic" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="nameEnglish" control={activeControl} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="name-english" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Controller name="isCustomer" control={activeControl} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label={<FormattedMessage id="party-customer" />} />} />
              <Controller name="isSupplier" control={activeControl} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label={<FormattedMessage id="party-supplier" />} />} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller name="primaryPhone" control={activeControl} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="primary-phone" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller name="secondaryPhone" control={activeControl} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="secondary-phone" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller name="email" control={activeControl} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="email" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="address" control={activeControl} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="address" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="notes" control={activeControl} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          {dialog?.mode === 'create' && (
            <>
              <Grid item xs={12} md={4}>
                <Controller name="openingBalance.amount" control={createForm.control} render={({ field, fieldState }) => <TextField {...field} type="number" onChange={(event) => field.onChange(Number(event.target.value))} fullWidth label={<FormattedMessage id="opening-balance" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller name="openingBalance.balanceNature" control={createForm.control} render={({ field, fieldState }) => (
                  <TextField {...field} fullWidth select label={<FormattedMessage id="balance-direction" />} error={!!fieldState.error} helperText={fieldState.error?.message}>
                    <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                    <MenuItem value="Debit"><FormattedMessage id="debit" /></MenuItem>
                    <MenuItem value="Credit"><FormattedMessage id="credit" /></MenuItem>
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller name="openingBalance.entryDate" control={createForm.control} render={({ field }) => <TextField {...field} value={field.value ?? ''} type="date" fullWidth label={<FormattedMessage id="opening-balance-date" />} InputLabelProps={{ shrink: true }} />} />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
        <Button variant="contained" onClick={save} disabled={isSaving}><FormattedMessage id={isSaving ? 'loading' : 'save'} /></Button>
      </DialogActions>
    </Dialog>
  );
}

function cleanCreate(values: CreatePartyRequest): CreatePartyRequest {
  return {
    ...values,
    primaryPhone: values.primaryPhone || null,
    secondaryPhone: values.secondaryPhone || null,
    email: values.email || null,
    address: values.address || null,
    notes: values.notes || null,
    openingBalance: values.openingBalance?.amount && values.openingBalance.amount > 0 ? values.openingBalance : null
  };
}

function cleanUpdate(values: UpdatePartyRequest): UpdatePartyRequest {
  return {
    ...values,
    primaryPhone: values.primaryPhone || null,
    secondaryPhone: values.secondaryPhone || null,
    email: values.email || null,
    address: values.address || null,
    notes: values.notes || null
  };
}
