import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@mui/material/Button';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEdit, IconEye, IconLock, IconLockOpen, IconRefresh, IconUserPlus, IconUserX } from '@tabler/icons-react';

import { Link } from 'react-router-dom';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from '../components/PermissionGuard';
import RoleSelector from '../components/RoleSelector';
import UserLockChip from '../components/UserLockChip';
import UserStatusChip from '../components/UserStatusChip';
import {
  activateUser,
  assignUserRoles,
  createUser,
  deactivateUser,
  lockUser,
  resetUserPassword,
  unlockUser,
  updateUser
} from '../api/administrationApi';
import { useRoles, useUsers } from '../hooks/useAdministration';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { resetPasswordSchema } from '../schemas/reset-password.schema';
import type { CreateUserRequest, ResetPasswordRequest, UpdateUserRequest, UserDto } from '../types/administration.types';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';

type UserDialogState = { mode: 'create' | 'edit' | 'roles' | 'reset'; user?: UserDto } | null;

export default function UsersListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<string>('');
  const [isLocked, setIsLocked] = useState<string>('');
  const [dialog, setDialog] = useState<UserDialogState>(null);
  const { items: users, meta, isLoading, error, mutate } = useUsers({
    page: page + 1,
    pageSize,
    search,
    isActive,
    isLocked
  });
  const { items: roles } = useRoles({ pageSize: 100 });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      await mutate();
      notify(message);
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'administration-action-failed' }), 'error');
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="administration-users" links={[{ title: 'administration' }, { title: 'administration-users' }]} />
      <MainCard
        title={<FormattedMessage id="administration-users" />}
        secondary={
          <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersCreate}>
            <Button variant="contained" startIcon={<IconUserPlus size={18} />} onClick={() => setDialog({ mode: 'create' })}>
              <FormattedMessage id="create-user" />
            </Button>
          </PermissionGuard>
        }
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label={intl.formatMessage({ id: 'search' })} value={search} onChange={(event) => setSearch(event.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField fullWidth select label={intl.formatMessage({ id: 'status' })} value={isActive} onChange={(event) => setIsActive(event.target.value)}>
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              <MenuItem value="true">
                <FormattedMessage id="active" />
              </MenuItem>
              <MenuItem value="false">
                <FormattedMessage id="inactive" />
              </MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField fullWidth select label={intl.formatMessage({ id: 'lock-status' })} value={isLocked} onChange={(event) => setIsLocked(event.target.value)}>
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              <MenuItem value="true">
                <FormattedMessage id="locked" />
              </MenuItem>
              <MenuItem value="false">
                <FormattedMessage id="unlocked" />
              </MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="administration-load-error" /></Typography>}
        {!isLoading && users.length === 0 && <Typography><FormattedMessage id="administration-empty-users" /></Typography>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="name" /></TableCell>
                <TableCell><FormattedMessage id="email" /></TableCell>
                <TableCell><FormattedMessage id="roles" /></TableCell>
                <TableCell><FormattedMessage id="status" /></TableCell>
                <TableCell><FormattedMessage id="lock-status" /></TableCell>
                <TableCell><FormattedMessage id="last-login" /></TableCell>
                <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles.map((role) => role.name).join(', ') || '-'}</TableCell>
                  <TableCell><UserStatusChip isActive={user.isActive} /></TableCell>
                  <TableCell><UserLockChip isLocked={user.isLocked} /></TableCell>
                  <TableCell>{user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={intl.formatMessage({ id: 'details' })}>
                      <IconButton component={Link} to={`/administration/users/${user.id}`}><IconEye size={18} /></IconButton>
                    </Tooltip>
                    <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersUpdate}>
                      <IconButton onClick={() => setDialog({ mode: 'edit', user })}><IconEdit size={18} /></IconButton>
                    </PermissionGuard>
                    <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersAssignRoles}>
                      <Button size="small" onClick={() => setDialog({ mode: 'roles', user })}><FormattedMessage id="assign-roles" /></Button>
                    </PermissionGuard>
                    <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersResetPassword}>
                      <IconButton onClick={() => setDialog({ mode: 'reset', user })}><IconRefresh size={18} /></IconButton>
                    </PermissionGuard>
                    <PermissionGuard permission={user.isLocked ? ADMINISTRATION_PERMISSIONS.usersUnlock : ADMINISTRATION_PERMISSIONS.usersLock}>
                      <IconButton onClick={() => runAction(() => (user.isLocked ? unlockUser(user.id) : lockUser(user.id)), intl.formatMessage({ id: 'administration-action-success' }))}>
                        {user.isLocked ? <IconLockOpen size={18} /> : <IconLock size={18} />}
                      </IconButton>
                    </PermissionGuard>
                    <PermissionGuard permission={user.isActive ? ADMINISTRATION_PERMISSIONS.usersDeactivate : ADMINISTRATION_PERMISSIONS.usersActivate}>
                      <IconButton onClick={() => runAction(() => (user.isActive ? deactivateUser(user.id) : activateUser(user.id)), intl.formatMessage({ id: 'administration-action-success' }))}>
                        <IconUserX size={18} />
                      </IconButton>
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

      <UserDialog dialog={dialog} roles={roles} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); mutate(); notify(intl.formatMessage({ id: 'administration-action-success' })); }} />
    </>
  );
}

function UserDialog({ dialog, roles, onClose, onSaved }: { dialog: UserDialogState; roles: any[]; onClose: () => void; onSaved: () => void }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const createForm = useForm<CreateUserRequest>({ resolver: zodResolver(createUserSchema), values: { displayName: '', email: '', password: '', confirmPassword: '', roleIds: [] } });
  const updateForm = useForm<UpdateUserRequest>({ resolver: zodResolver(updateUserSchema), values: { displayName: dialog?.user?.displayName ?? '', email: dialog?.user?.email ?? '', rowVersion: dialog?.user?.rowVersion ?? '' } });
  const resetForm = useForm<ResetPasswordRequest>({ resolver: zodResolver(resetPasswordSchema), values: { newPassword: '', confirmPassword: '' } });
  const rolesForm = useForm<{ roleIds: string[] }>({ values: { roleIds: dialog?.user?.roles.map((role) => role.id) ?? [] } });

  const notifyError = (error: unknown) => {
    dispatch(
      openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : intl.formatMessage({ id: 'administration-action-failed' }),
        variant: 'alert',
        severity: 'error'
      })
    );
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
    if (dialog.mode === 'create') void createForm.handleSubmit((values) => persist(() => createUser(values)))();
    if (dialog.mode === 'edit' && dialog.user) void updateForm.handleSubmit((values) => persist(() => updateUser(dialog.user!.id, values)))();
    if (dialog.mode === 'reset' && dialog.user) void resetForm.handleSubmit((values) => persist(() => resetUserPassword(dialog.user!.id, values)))();
    if (dialog.mode === 'roles' && dialog.user) void persist(() => assignUserRoles(dialog.user!.id, rolesForm.getValues()));
  };

  return (
    <Dialog open={Boolean(dialog)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle><FormattedMessage id={dialog?.mode === 'create' ? 'create-user' : dialog?.mode === 'reset' ? 'reset-password' : dialog?.mode === 'roles' ? 'assign-roles' : 'edit-user'} /></DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {dialog?.mode === 'create' && (
            <>
              <TextField label={intl.formatMessage({ id: 'name' })} {...createForm.register('displayName')} error={!!createForm.formState.errors.displayName} helperText={createForm.formState.errors.displayName?.message} />
              <TextField label={intl.formatMessage({ id: 'email' })} {...createForm.register('email')} error={!!createForm.formState.errors.email} helperText={createForm.formState.errors.email?.message} />
              <TextField type="password" label={intl.formatMessage({ id: 'password' })} {...createForm.register('password')} error={!!createForm.formState.errors.password} helperText={createForm.formState.errors.password?.message} />
              <TextField type="password" label={intl.formatMessage({ id: 'confirm-password' })} {...createForm.register('confirmPassword')} error={!!createForm.formState.errors.confirmPassword} helperText={createForm.formState.errors.confirmPassword?.message} />
              <Controller control={createForm.control} name="roleIds" render={({ field }) => <RoleSelector roles={roles} value={field.value} onChange={field.onChange} />} />
            </>
          )}
          {dialog?.mode === 'edit' && (
            <>
              <TextField label={intl.formatMessage({ id: 'name' })} {...updateForm.register('displayName')} error={!!updateForm.formState.errors.displayName} helperText={updateForm.formState.errors.displayName?.message} />
              <TextField label={intl.formatMessage({ id: 'email' })} {...updateForm.register('email')} error={!!updateForm.formState.errors.email} helperText={updateForm.formState.errors.email?.message} />
            </>
          )}
          {dialog?.mode === 'roles' && <Controller control={rolesForm.control} name="roleIds" render={({ field }) => <RoleSelector roles={roles} value={field.value} onChange={field.onChange} />} />}
          {dialog?.mode === 'reset' && (
            <>
              <TextField type="password" label={intl.formatMessage({ id: 'new-password' })} {...resetForm.register('newPassword')} error={!!resetForm.formState.errors.newPassword} helperText={resetForm.formState.errors.newPassword?.message} />
              <TextField type="password" label={intl.formatMessage({ id: 'confirm-password' })} {...resetForm.register('confirmPassword')} error={!!resetForm.formState.errors.confirmPassword} helperText={resetForm.formState.errors.confirmPassword?.message} />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
        <Button variant="contained" onClick={save} disabled={isSaving}><FormattedMessage id={isSaving ? 'loading' : 'save'} /></Button>
      </DialogActions>
    </Dialog>
  );
}
