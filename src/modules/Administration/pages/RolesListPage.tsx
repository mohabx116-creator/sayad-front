import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
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
import Typography from '@mui/material/Typography';
import { IconEdit, IconEye, IconShieldPlus } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from '../components/PermissionGuard';
import PermissionSelector from '../components/PermissionSelector';
import RoleStatusChip from '../components/RoleStatusChip';
import { activateRole, assignRolePermissions, createRole, deactivateRole, updateRole } from '../api/administrationApi';
import { usePermissions, useRoles } from '../hooks/useAdministration';
import { createRoleSchema, updateRoleSchema } from '../schemas/role.schema';
import type { CreateRoleRequest, RoleDto, UpdateRoleRequest } from '../types/administration.types';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';

type RoleDialogState = { mode: 'create' | 'edit' | 'permissions'; role?: RoleDto } | null;

export default function RolesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<string>('');
  const [dialog, setDialog] = useState<RoleDialogState>(null);
  const { items: roles, meta, isLoading, error, mutate } = useRoles({ page: page + 1, pageSize, search, isActive });
  const { permissions } = usePermissions();

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await mutate();
      notify(intl.formatMessage({ id: 'administration-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'administration-action-failed' }), 'error');
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="administration-roles-permissions" links={[{ title: 'administration' }, { title: 'administration-roles-permissions' }]} />
      <MainCard
        title={<FormattedMessage id="administration-roles-permissions" />}
        secondary={
          <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.rolesCreate}>
            <Button variant="contained" startIcon={<IconShieldPlus size={18} />} onClick={() => setDialog({ mode: 'create' })}>
              <FormattedMessage id="create-role" />
            </Button>
          </PermissionGuard>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField fullWidth label={intl.formatMessage({ id: 'search' })} value={search} onChange={(event) => setSearch(event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth select label={intl.formatMessage({ id: 'status' })} value={isActive} onChange={(event) => setIsActive(event.target.value)}>
              <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
              <MenuItem value="true"><FormattedMessage id="active" /></MenuItem>
              <MenuItem value="false"><FormattedMessage id="inactive" /></MenuItem>
            </TextField>
          </Grid>
        </Grid>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="administration-load-error" /></Typography>}
        {!isLoading && roles.length === 0 && <Typography><FormattedMessage id="administration-empty-roles" /></Typography>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="role-name" /></TableCell>
                <TableCell><FormattedMessage id="description" /></TableCell>
                <TableCell><FormattedMessage id="users-count" /></TableCell>
                <TableCell><FormattedMessage id="permissions-count" /></TableCell>
                <TableCell><FormattedMessage id="system-role" /></TableCell>
                <TableCell><FormattedMessage id="status" /></TableCell>
                <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.descriptionEnglish || role.descriptionArabic || '-'}</TableCell>
                  <TableCell>{role.usersCount}</TableCell>
                  <TableCell>{role.permissionsCount}</TableCell>
                  <TableCell>{role.isSystem ? <Chip size="small" color="secondary" label={<FormattedMessage id="system-role" />} /> : '-'}</TableCell>
                  <TableCell><RoleStatusChip isActive={role.isActive} /></TableCell>
                  <TableCell align="right">
                    <IconButton component={Link} to={`/administration/roles/${role.id}`}><IconEye size={18} /></IconButton>
                    <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.rolesUpdate}>
                      <IconButton onClick={() => setDialog({ mode: 'edit', role })}><IconEdit size={18} /></IconButton>
                    </PermissionGuard>
                    <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.rolesAssignPermissions}>
                      <Button size="small" onClick={() => setDialog({ mode: 'permissions', role })}><FormattedMessage id="assign-permissions" /></Button>
                    </PermissionGuard>
                    <PermissionGuard permission={role.isActive ? ADMINISTRATION_PERMISSIONS.rolesDeactivate : ADMINISTRATION_PERMISSIONS.rolesActivate}>
                      <Button size="small" disabled={role.isSystem && role.isActive} onClick={() => runAction(() => (role.isActive ? deactivateRole(role.id) : activateRole(role.id)))}>
                        <FormattedMessage id={role.isActive ? 'deactivate' : 'activate'} />
                      </Button>
                    </PermissionGuard>
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
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
        />
      </MainCard>
      <RoleDialog dialog={dialog} permissions={permissions} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); mutate(); notify(intl.formatMessage({ id: 'administration-action-success' })); }} />
    </>
  );
}

function RoleDialog({ dialog, permissions, onClose, onSaved }: { dialog: RoleDialogState; permissions: any[]; onClose: () => void; onSaved: () => void }) {
  const intl = useIntl();
  const createForm = useForm<CreateRoleRequest>({ resolver: zodResolver(createRoleSchema), values: { name: '', descriptionArabic: '', descriptionEnglish: '', permissionIds: [] } });
  const updateForm = useForm<UpdateRoleRequest>({
    resolver: zodResolver(updateRoleSchema),
    values: {
      name: dialog?.role?.name ?? '',
      descriptionArabic: dialog?.role?.descriptionArabic ?? '',
      descriptionEnglish: dialog?.role?.descriptionEnglish ?? '',
      rowVersion: dialog?.role?.rowVersion ?? ''
    }
  });
  const permissionsForm = useForm<{ permissionIds: string[] }>({ values: { permissionIds: dialog?.role?.permissions.map((permission) => permission.id) ?? [] } });

  const save = async () => {
    if (!dialog) return;
    if (dialog.mode === 'create') await createRole(createForm.getValues());
    if (dialog.mode === 'edit' && dialog.role) await updateRole(dialog.role.id, updateForm.getValues());
    if (dialog.mode === 'permissions' && dialog.role) await assignRolePermissions(dialog.role.id, permissionsForm.getValues());
    onSaved();
  };

  return (
    <Dialog open={Boolean(dialog)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle><FormattedMessage id={dialog?.mode === 'create' ? 'create-role' : dialog?.mode === 'permissions' ? 'assign-permissions' : 'edit-role'} /></DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {dialog?.mode === 'create' && (
            <>
              <TextField label={intl.formatMessage({ id: 'role-name' })} {...createForm.register('name')} error={!!createForm.formState.errors.name} helperText={createForm.formState.errors.name?.message} />
              <TextField label={intl.formatMessage({ id: 'description-arabic' })} {...createForm.register('descriptionArabic')} />
              <TextField label={intl.formatMessage({ id: 'description-english' })} {...createForm.register('descriptionEnglish')} />
              <Controller control={createForm.control} name="permissionIds" render={({ field }) => <PermissionSelector permissions={permissions} value={field.value} onChange={field.onChange} />} />
            </>
          )}
          {dialog?.mode === 'edit' && (
            <>
              <TextField label={intl.formatMessage({ id: 'role-name' })} disabled={dialog.role?.isSystem} {...updateForm.register('name')} error={!!updateForm.formState.errors.name} helperText={updateForm.formState.errors.name?.message} />
              <TextField label={intl.formatMessage({ id: 'description-arabic' })} {...updateForm.register('descriptionArabic')} />
              <TextField label={intl.formatMessage({ id: 'description-english' })} {...updateForm.register('descriptionEnglish')} />
            </>
          )}
          {dialog?.mode === 'permissions' && <Controller control={permissionsForm.control} name="permissionIds" render={({ field }) => <PermissionSelector permissions={permissions} value={field.value} onChange={field.onChange} />} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}><FormattedMessage id="cancel" /></Button>
        <Button variant="contained" onClick={save}><FormattedMessage id="save" /></Button>
      </DialogActions>
    </Dialog>
  );
}
