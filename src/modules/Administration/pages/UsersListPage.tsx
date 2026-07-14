import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
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
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { IconDotsVertical, IconSearch, IconFilter, IconDownload, IconUserPlus } from '@tabler/icons-react';

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
import UserManagementModal from '../components/UserManagementModal';
import {
  createUser,
  lockUser,
  resetUserPassword,
  unlockUser
} from '../api/administrationApi';
import { useRoles, useUsers } from '../hooks/useAdministration';
import { createUserSchema } from '../schemas/user.schema';
import { resetPasswordSchema } from '../schemas/reset-password.schema';
import type { CreateUserRequest, ResetPasswordRequest, UserDto } from '../types/administration.types';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';

type UserDialogState = { mode: 'create' | 'reset' | 'manage'; user?: UserDto } | null;

const roleColors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'] as const;

export default function UsersListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Filter state
  const [isActive, setIsActive] = useState<string>('');
  const [isLocked, setIsLocked] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [dialog, setDialog] = useState<UserDialogState>(null);

  // Action menu state
  const [actionAnchorEl, setActionAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

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

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    setActionAnchorEl({ ...actionAnchorEl, [userId]: event.currentTarget });
  };

  const handleActionClose = (userId: string) => {
    setActionAnchorEl({ ...actionAnchorEl, [userId]: null });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]} ${parts[1][0]}`;
    return name.slice(0, 2);
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
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="inherit" startIcon={<IconDownload size={18} />}>
              <FormattedMessage id="export" />
            </Button>
            <Button variant="outlined" color="inherit" startIcon={<IconFilter size={18} />} onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
              <FormattedMessage id="filter" />
            </Button>
            <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => setFilterAnchorEl(null)}>
              <Stack spacing={2} sx={{ p: 2, minWidth: 250 }}>
                <TextField fullWidth select size="small" label={intl.formatMessage({ id: 'status' })} value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                  <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                  <MenuItem value="true"><FormattedMessage id="active" /></MenuItem>
                  <MenuItem value="false"><FormattedMessage id="inactive" /></MenuItem>
                </TextField>
                <TextField fullWidth select size="small" label={intl.formatMessage({ id: 'lock-status' })} value={isLocked} onChange={(event) => setIsLocked(event.target.value)}>
                  <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
                  <MenuItem value="true"><FormattedMessage id="locked" /></MenuItem>
                  <MenuItem value="false"><FormattedMessage id="unlocked" /></MenuItem>
                </TextField>
              </Stack>
            </Menu>
          </Stack>
          <TextField
            sx={{ width: { xs: '100%', md: 400 } }}
            placeholder={intl.formatMessage({ id: 'search-placeholder' })}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={20} stroke={1.5} />
                </InputAdornment>
              )
            }}
          />
        </Stack>

        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="administration-load-error" /></Typography>}
        {!isLoading && users.length === 0 && <Typography><FormattedMessage id="administration-empty-users" /></Typography>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {/* Dummy checkbox for UI matching */}
                  <input type="checkbox" disabled />
                </TableCell>
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
                  <TableCell padding="checkbox">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 32, height: 32, fontSize: '1rem', fontWeight: 'bold' }}>
                        {getInitials(user.displayName)}
                      </Avatar>
                      <Typography variant="body1">{user.displayName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {user.roles.length > 0 ? user.roles.map((role, idx) => (
                        <Chip key={role.id} label={role.name} size="small" color={roleColors[idx % roleColors.length]} variant="filled" sx={{ color: 'white', fontWeight: 600 }} />
                      )) : '-'}
                    </Stack>
                  </TableCell>
                  <TableCell><UserStatusChip isActive={user.isActive} /></TableCell>
                  <TableCell><UserLockChip isLocked={user.isLocked} /></TableCell>
                  <TableCell>{user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleActionClick(e, user.id)}>
                      <IconDotsVertical size={20} />
                    </IconButton>
                    <Menu
                      anchorEl={actionAnchorEl[user.id]}
                      open={Boolean(actionAnchorEl[user.id])}
                      onClose={() => handleActionClose(user.id)}
                    >
                      <MenuItem component={Link} to={`/administration/users/${user.id}`}>
                        <FormattedMessage id="details" />
                      </MenuItem>
                      <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersUpdate}>
                        <MenuItem onClick={() => { handleActionClose(user.id); setDialog({ mode: 'manage', user }); }}>
                          <FormattedMessage id="manage-user-data" />
                        </MenuItem>
                      </PermissionGuard>
                      <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersResetPassword}>
                        <MenuItem onClick={() => { handleActionClose(user.id); setDialog({ mode: 'reset', user }); }}>
                          <FormattedMessage id="reset-password" />
                        </MenuItem>
                      </PermissionGuard>
                      <PermissionGuard permission={user.isLocked ? ADMINISTRATION_PERMISSIONS.usersUnlock : ADMINISTRATION_PERMISSIONS.usersLock}>
                        <MenuItem onClick={() => {
                          handleActionClose(user.id);
                          runAction(() => (user.isLocked ? unlockUser(user.id) : lockUser(user.id)), intl.formatMessage({ id: 'administration-action-success' }));
                        }}>
                          <FormattedMessage id={user.isLocked ? "unlock" : "lock"} />
                        </MenuItem>
                      </PermissionGuard>
                    </Menu>
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
          labelDisplayedRows={({ from, to, count }) => `عرض ${from} إلى ${to} من ${count} مستخدم`}
        />
      </MainCard>

      {/* Legacy dialog for Create and Reset Password */}
      {dialog && dialog.mode !== 'manage' && (
        <UserDialog dialog={dialog} roles={roles} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); mutate(); notify(intl.formatMessage({ id: 'administration-action-success' })); }} />
      )}

      {/* New Unified User Management Modal */}
      {dialog && dialog.mode === 'manage' && dialog.user && (
        <UserManagementModal user={dialog.user} roles={roles} onClose={() => setDialog(null)} onSaved={() => { mutate(); notify(intl.formatMessage({ id: 'administration-action-success' })); }} />
      )}
    </>
  );
}

function UserDialog({ dialog, roles, onClose, onSaved }: { dialog: UserDialogState; roles: any[]; onClose: () => void; onSaved: () => void }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const createForm = useForm<CreateUserRequest>({ resolver: zodResolver(createUserSchema), values: { displayName: '', email: '', password: '', confirmPassword: '', roleIds: [] } });
  const resetForm = useForm<ResetPasswordRequest>({ resolver: zodResolver(resetPasswordSchema), values: { newPassword: '', confirmPassword: '' } });

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
    if (dialog.mode === 'reset' && dialog.user) void resetForm.handleSubmit((values) => persist(() => resetUserPassword(dialog.user!.id, values)))();
  };

  return (
    <Dialog open={Boolean(dialog)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle><FormattedMessage id={dialog?.mode === 'create' ? 'create-user' : 'reset-password'} /></DialogTitle>
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
