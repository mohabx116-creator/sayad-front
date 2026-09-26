import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
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
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { IconDotsVertical, IconSearch, IconFilter, IconDownload, IconUserPlus, IconTrash } from '@tabler/icons-react';

import { Link, useLocation } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from '../components/PermissionGuard';
import PermissionSelector from '../components/PermissionSelector';
import RoleSelector from '../components/RoleSelector';
import UserLockChip from '../components/UserLockChip';
import UserStatusChip from '../components/UserStatusChip';
import UserManagementModal from '../components/UserManagementModal';
import { createRole, createUser, deleteUser, lockUser, resetUserPassword, unlockUser } from '../api/administrationApi';
import { usePermissions, useRoles, useUsers } from '../hooks/useAdministration';
import { createRoleSchema } from '../schemas/role.schema';
import { buildCreateUserSchema } from '../schemas/user.schema';
import { resetPasswordSchema } from '../schemas/reset-password.schema';
import type { CreateRoleRequest, CreateUserRequest, PermissionDto, ResetPasswordRequest, RoleDto, UserDto } from '../types/administration.types';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';
import { getAdministrationRouteBase, getAdministrationScope } from '../utils/administration-scope';
import { buildCreateUserValidationMessages, resolveCreateUserValidationState } from '../utils/create-user-validation';

type UserDialogState = { mode: 'create' | 'reset' | 'manage'; user?: UserDto } | null;

const roleColors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'] as const;

export default function UsersListPage() {
  const intl = useIntl();
  const { user: currentUser } = useAuth();
  const { pathname } = useLocation();
  const routeBase = getAdministrationRouteBase(pathname);
  const scope = getAdministrationScope(pathname);
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  // Filter state
  const [isActive, setIsActive] = useState<string>('');
  const [isLocked, setIsLocked] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [dialog, setDialog] = useState<UserDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);

  // Action menu state
  const [actionAnchorEl, setActionAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const {
    items: users,
    meta,
    isLoading,
    error,
    mutate
  } = useUsers({
    page: page + 1,
    pageSize,
    search,
    isActive,
    isLocked
  });
  const { items: roles } = useRoles({ pageSize: 100 });
  const { permissions, isLoading: permissionsLoading, error: permissionsError } = usePermissions();

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

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await mutate();
      notify(intl.formatMessage({ id: 'user-deleted-successfully' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'administration-action-failed' }), 'error');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]} ${parts[1][0]}`;
    return name.slice(0, 2);
  };

  return (
    <>
      <Breadcrumbs
        custom
        heading={scope === 'system' ? 'system-users' : 'administration-users'}
        links={[{ title: scope === 'system' ? 'system-administration' : 'administration' }, { title: scope === 'system' ? 'system-users' : 'administration-users' }]}
      />
      <MainCard
        title={<FormattedMessage id={scope === 'system' ? 'system-users' : 'administration-users'} />}
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
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<IconFilter size={18} />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            >
              <FormattedMessage id="filter" />
            </Button>
            <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => setFilterAnchorEl(null)}>
              <Stack spacing={2} sx={{ p: 2, minWidth: 250 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label={intl.formatMessage({ id: 'status' })}
                  value={isActive}
                  onChange={(event) => setIsActive(event.target.value)}
                >
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
                <TextField
                  fullWidth
                  select
                  size="small"
                  label={intl.formatMessage({ id: 'lock-status' })}
                  value={isLocked}
                  onChange={(event) => setIsLocked(event.target.value)}
                >
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
        {error && (
          <Typography color="error">
            <FormattedMessage id="administration-load-error" />
          </Typography>
        )}
        {!isLoading && users.length === 0 && (
          <Typography>
            <FormattedMessage id="administration-empty-users" />
          </Typography>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {/* Dummy checkbox for UI matching */}
                  <input type="checkbox" disabled />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="name" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="email" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="roles" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="status" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="lock-status" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="last-login" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="actions" />
                </TableCell>
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
                      <Avatar
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          width: 32,
                          height: 32,
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {getInitials(user.displayName)}
                      </Avatar>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="body1">{user.displayName}</Typography>
                        {user.isSystemOwner && (
                          <Chip
                            size="small"
                            color="warning"
                            label={intl.formatMessage({ id: 'system-owner', defaultMessage: 'مالك النظام' })}
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {user.roles.length > 0
                        ? user.roles.map((role, idx) => (
                            <Chip
                              key={role.id}
                              label={role.name}
                              size="small"
                              color={roleColors[idx % roleColors.length]}
                              variant="filled"
                              sx={{ color: 'white', fontWeight: 600 }}
                            />
                          ))
                        : '-'}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <UserStatusChip isActive={user.isActive} />
                  </TableCell>
                  <TableCell>
                    <UserLockChip isLocked={user.isLocked} />
                  </TableCell>
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
                      <MenuItem component={Link} to={`${routeBase}/users/${user.id}`}>
                        <FormattedMessage id="details" />
                      </MenuItem>
                      <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersUpdate}>
                        <MenuItem
                          onClick={() => {
                            handleActionClose(user.id);
                            setDialog({ mode: 'manage', user });
                          }}
                        >
                          <FormattedMessage id="manage-user-data" />
                        </MenuItem>
                      </PermissionGuard>
                      <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersResetPassword}>
                        <MenuItem
                          onClick={() => {
                            handleActionClose(user.id);
                            setDialog({ mode: 'reset', user });
                          }}
                        >
                          <FormattedMessage id="reset-password" />
                        </MenuItem>
                      </PermissionGuard>
                      <PermissionGuard
                        permission={user.isLocked ? ADMINISTRATION_PERMISSIONS.usersUnlock : ADMINISTRATION_PERMISSIONS.usersLock}
                      >
                        <MenuItem
                          onClick={() => {
                            handleActionClose(user.id);
                            runAction(
                              () => (user.isLocked ? unlockUser(user.id) : lockUser(user.id)),
                              intl.formatMessage({ id: 'administration-action-success' })
                            );
                          }}
                        >
                          <FormattedMessage id={user.isLocked ? 'unlock' : 'lock'} />
                        </MenuItem>
                      </PermissionGuard>
                      <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.usersDelete}>
                        <MenuItem
                          disabled={user.isSystemOwner || user.id === currentUser?.id}
                          onClick={() => {
                            handleActionClose(user.id);
                            setDeleteTarget(user);
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconTrash size={16} />
                            <FormattedMessage id="delete-user" />
                          </Stack>
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
        <UserDialog
          dialog={dialog}
          roles={roles}
          permissions={permissions}
          permissionsError={permissionsError}
          permissionsLoading={permissionsLoading}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            mutate();
            notify(intl.formatMessage({ id: 'administration-action-success' }));
          }}
        />
      )}

      {/* New Unified User Management Modal */}
      {dialog && dialog.mode === 'manage' && dialog.user && (
        <UserManagementModal
          user={dialog.user}
          roles={roles}
          onClose={() => setDialog(null)}
          onSaved={() => {
            mutate();
            notify(intl.formatMessage({ id: 'administration-action-success' }));
          }}
        />
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <FormattedMessage id="confirm-delete-user" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage
                id="confirm-delete-user-description"
                values={{ name: deleteTarget?.displayName ?? deleteTarget?.email ?? '' }}
              />
            </Typography>
            <Alert severity="warning">
              <FormattedMessage id="permanent-deletion-warning" />
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button color="error" variant="contained" onClick={confirmDeleteUser} startIcon={<IconTrash size={18} />}>
            <FormattedMessage id="delete-user" />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function UserDialog({
  dialog,
  roles,
  permissions,
  permissionsLoading,
  permissionsError,
  onClose,
  onSaved
}: {
  dialog: UserDialogState;
  roles: RoleDto[];
  permissions: PermissionDto[];
  permissionsLoading: boolean;
  permissionsError: unknown;
  onClose: () => void;
  onSaved: () => void;
}) {
  const intl = useIntl();
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSaving, setIsSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>(roles);
  const [includeCustomRole, setIncludeCustomRole] = useState(false);
  const [createdCustomRole, setCreatedCustomRole] = useState<RoleDto | null>(null);
  const [partialSuccessMessage, setPartialSuccessMessage] = useState<string | null>(null);
  const [inactiveRoleWarning, setInactiveRoleWarning] = useState<string | null>(null);

  const createUserSchema = useMemo(
    () => buildCreateUserSchema(buildCreateUserValidationMessages(intl), { requireRole: !includeCustomRole }),
    [includeCustomRole, intl]
  );

  const customRoleSchema = useMemo(
    () =>
      createRoleSchema.refine((value) => value.permissionIds.length > 0, {
        path: ['permissionIds'],
        message: intl.formatMessage({ id: 'select-at-least-one-permission', defaultMessage: 'Select at least one permission.' })
      }),
    [intl]
  );

  const createForm = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '', roleIds: [] }
  });
  const resetForm = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  });
  const customRoleForm = useForm<CreateRoleRequest>({
    resolver: zodResolver(customRoleSchema),
    defaultValues: { name: '', descriptionArabic: '', descriptionEnglish: '', permissionIds: [] }
  });
  const customRolePermissionError = customRoleForm.formState.errors.permissionIds?.message;
  const createRoleIds = createForm.watch('roleIds');

  useEffect(() => {
    setAvailableRoles((current) => {
      const merged = new Map<string, RoleDto>();

      [...roles, ...current].forEach((role) => {
        if (role.isActive && !merged.has(role.id)) {
          merged.set(role.id, role);
        }
      });

      return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
    });
  }, [roles]);

  useEffect(() => {
    if (!dialog) return;

    setIncludeCustomRole(false);
    setCreatedCustomRole(null);
    setPartialSuccessMessage(null);
    setInactiveRoleWarning(null);
    setAvailableRoles(() => roles.filter((role) => role.isActive));
    createForm.reset({ displayName: '', email: '', password: '', confirmPassword: '', roleIds: [] });
    resetForm.reset({ newPassword: '', confirmPassword: '' });
    customRoleForm.reset({ name: '', descriptionArabic: '', descriptionEnglish: '', permissionIds: [] });
  }, [createForm, customRoleForm, dialog, resetForm, roles]);

  useEffect(() => {
    if (dialog?.mode !== 'create') return;

    const activeRoleIds = new Set(availableRoles.filter((role) => role.isActive).map((role) => role.id));
    const currentRoleIds = createRoleIds ?? [];
    const filteredRoleIds = currentRoleIds.filter((roleId) => activeRoleIds.has(roleId));

    if (filteredRoleIds.length !== currentRoleIds.length) {
      createForm.setValue('roleIds', filteredRoleIds, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      createForm.setError('roleIds', {
        type: 'manual',
        message: intl.formatMessage({
          id: 'create-user-inactive-role',
          defaultMessage: 'The selected role is inactive. Choose an active role to create the user.'
        })
      });
      setInactiveRoleWarning(
        intl.formatMessage({
          id: 'create-user-inactive-role',
          defaultMessage: 'The selected role is inactive. Choose an active role to create the user.'
        })
      );
    }
  }, [availableRoles, createForm, createRoleIds, dialog?.mode, intl]);

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

  const notifyCreateValidationError = (errors: FieldErrors<CreateUserRequest>) => {
    const firstInvalidField = (['displayName', 'email', 'password', 'confirmPassword', 'roleIds'] as const).find((fieldName) => Boolean(errors[fieldName]));
    const firstInvalidMessage = firstInvalidField ? errors[firstInvalidField]?.message : undefined;

    if (firstInvalidField) {
      createForm.setFocus(firstInvalidField);
    }

    dispatch(
      openSnackbar({
        open: true,
        message:
          typeof firstInvalidMessage === 'string'
            ? firstInvalidMessage
            : intl.formatMessage({ id: 'create-user-failed-summary', defaultMessage: 'The user could not be created. Review the entered data and try again.' }),
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

    if (dialog.mode === 'create') {
      void createForm.handleSubmit(async (values) => {
        let createdRoleForAttempt = createdCustomRole;
        try {
          setIsSaving(true);
          setPartialSuccessMessage(null);
          setInactiveRoleWarning(null);

          let roleIds = Array.from(new Set(values.roleIds.map((roleId) => roleId.trim()).filter(Boolean)));
          const activeRoleIds = new Set(availableRoles.filter((role) => role.isActive).map((role) => role.id));
          const knownRoleIds = new Set(availableRoles.map((role) => role.id));

          if (roleIds.length === 0 && !includeCustomRole) {
            const message = intl.formatMessage({
              id: 'create-user-no-role-selected',
              defaultMessage: 'Select at least one active role.'
            });
            createForm.setError('roleIds', { type: 'manual', message });
            setInactiveRoleWarning(message);
            return;
          }

          if (roleIds.length !== values.roleIds.length) {
            createForm.setValue('roleIds', roleIds, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          }

          const inactiveRoleIds = roleIds.filter((roleId) => !activeRoleIds.has(roleId));
          if (inactiveRoleIds.length > 0) {
            const message = intl.formatMessage({
              id: 'create-user-inactive-role',
              defaultMessage: 'The selected role is inactive. Choose an active role to create the user.'
            });
            createForm.setValue(
              'roleIds',
              roleIds.filter((roleId) => activeRoleIds.has(roleId)),
              { shouldDirty: true, shouldTouch: true, shouldValidate: true }
            );
            createForm.setError('roleIds', { type: 'manual', message });
            setInactiveRoleWarning(message);
            return;
          }

          const unknownRoleIds = roleIds.filter((roleId) => !knownRoleIds.has(roleId));
          if (unknownRoleIds.length > 0) {
            const message = intl.formatMessage({
              id: 'create-user-role-not-found',
              defaultMessage: 'One or more selected roles could not be found.'
            });
            createForm.setError('roleIds', { type: 'manual', message });
            setInactiveRoleWarning(message);
            return;
          }

          if (includeCustomRole) {
            if (!createdRoleForAttempt) {
              const isValid = await customRoleForm.trigger();
              if (!isValid) {
                const firstInvalidCustomRoleField = (['name', 'descriptionArabic', 'descriptionEnglish', 'permissionIds'] as const).find(
                  (fieldName) => customRoleForm.getFieldState(fieldName).invalid
                );
                if (firstInvalidCustomRoleField) {
                  customRoleForm.setFocus(firstInvalidCustomRoleField);
                }
                dispatch(
                  openSnackbar({
                    open: true,
                    message: intl.formatMessage({
                      id: 'create-user-failed-summary',
                      defaultMessage: 'The user could not be created. Review the entered data and try again.'
                    }),
                    variant: 'alert',
                    severity: 'error'
                  })
                );
                return;
              }

              createdRoleForAttempt = await createRole(customRoleForm.getValues());
              setCreatedCustomRole(createdRoleForAttempt);
            }

            const selectedCustomRole = createdRoleForAttempt;
            if (!selectedCustomRole) {
              throw new Error('Custom role creation did not complete.');
            }

            setAvailableRoles((current) => (current.some((role) => role.id === selectedCustomRole.id) ? current : [...current, selectedCustomRole]));

            roleIds = [...new Set([...roleIds, selectedCustomRole.id])];
            createForm.setValue('roleIds', roleIds, { shouldDirty: true, shouldTouch: true });
          }

          if (roleIds.length === 0) {
            const message = intl.formatMessage({
              id: 'create-user-no-role-selected',
              defaultMessage: 'Select at least one active role.'
            });
            createForm.setError('roleIds', { type: 'manual', message });
            setInactiveRoleWarning(message);
            return;
          }

          createForm.clearErrors('roleIds');
          await createUser({ ...values, roleIds });
          setCreatedCustomRole(null);
          setPartialSuccessMessage(null);
          onSaved();
        } catch (error) {
          if (createdRoleForAttempt) {
            const roleName = createdRoleForAttempt.name || customRoleForm.getValues('name');
            const partialSuccessMessage = intl.formatMessage({ id: 'custom-role-created-user-failed' }, { role: roleName });
            const validation = resolveCreateUserValidationState(error, intl);
            const message = `${partialSuccessMessage} ${validation.summary}`;
            setPartialSuccessMessage(message);
            dispatch(openSnackbar({ open: true, message, variant: 'alert', severity: 'warning' }));
            return;
          }

          const validation = resolveCreateUserValidationState(error, intl);
          Object.entries(validation.fieldErrors).forEach(([fieldName, message]) => {
            createForm.setError(fieldName as keyof CreateUserRequest, { type: 'server', message });
          });

          dispatch(openSnackbar({ open: true, message: validation.summary, variant: 'alert', severity: 'error' }));
        } finally {
          setIsSaving(false);
        }
      }, notifyCreateValidationError)();
      return;
    }

    if (dialog.mode === 'reset' && dialog.user) {
      void resetForm.handleSubmit((values) => persist(() => resetUserPassword(dialog.user!.id, values)))();
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save();
  };

  return (
    <Dialog
      open={Boolean(dialog)}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth={dialog?.mode === 'create' ? 'md' : 'sm'}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
    >
      <Box component="form" onSubmit={handleFormSubmit} noValidate>
        <DialogTitle>
          <FormattedMessage id={dialog?.mode === 'create' ? 'create-user' : 'reset-password'} />
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
          {dialog?.mode === 'create' && (
            <>
              <Alert severity="info">
                <FormattedMessage
                  id="create-user-access-info"
                  defaultMessage="Assign one or more existing roles, or create a reusable custom role during user creation. User-specific permissions are not supported."
                />
              </Alert>
              {partialSuccessMessage && (
                <Alert severity="warning">
                  {partialSuccessMessage}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Typography variant="h6">
                    <FormattedMessage id="basic-information" />
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label={intl.formatMessage({ id: 'name' })}
                      {...createForm.register('displayName')}
                      error={!!createForm.formState.errors.displayName}
                      helperText={createForm.formState.errors.displayName?.message}
                    />
                    <TextField
                      fullWidth
                      label={intl.formatMessage({ id: 'email' })}
                      {...createForm.register('email')}
                      error={!!createForm.formState.errors.email}
                      helperText={createForm.formState.errors.email?.message}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        type="password"
                        label={intl.formatMessage({ id: 'password' })}
                        {...createForm.register('password')}
                        error={!!createForm.formState.errors.password}
                        helperText={createForm.formState.errors.password?.message}
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label={intl.formatMessage({ id: 'confirm-password' })}
                        {...createForm.register('confirmPassword')}
                        error={!!createForm.formState.errors.confirmPassword}
                        helperText={createForm.formState.errors.confirmPassword?.message}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Typography variant="h6">
                    <FormattedMessage id="roles-and-permissions" />
                  </Typography>
                  <Controller
                    control={createForm.control}
                    name="roleIds"
                    render={({ field }) => (
                      <Stack spacing={1.5}>
                        <RoleSelector
                          roles={availableRoles}
                          value={field.value}
                          onChange={(nextValue) => {
                            if (inactiveRoleWarning) {
                              setInactiveRoleWarning(null);
                            }
                            field.onChange(nextValue);
                          }}
                          helperText={<FormattedMessage id="user-roles-info-alert" />}
                        />
                        {inactiveRoleWarning && <Alert severity="warning">{inactiveRoleWarning}</Alert>}
                        {createForm.formState.errors.roleIds?.message && !inactiveRoleWarning && (
                          <Typography variant="caption" color="error">
                            {createForm.formState.errors.roleIds.message}
                          </Typography>
                        )}
                      </Stack>
                    )}
                  />

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={includeCustomRole}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setIncludeCustomRole(checked);
                          if (checked && createdCustomRole) {
                            const nextRoleIds = Array.from(new Set([...createForm.getValues('roleIds'), createdCustomRole.id]));
                            createForm.setValue('roleIds', nextRoleIds, { shouldDirty: true, shouldTouch: true });
                          }
                        }}
                      />
                    }
                    label={<FormattedMessage id="create-custom-role" defaultMessage="Create custom role for this user" />}
                  />

                  {includeCustomRole && (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                      <Stack spacing={2}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          <FormattedMessage id="custom-role-details" defaultMessage="Custom role details" />
                        </Typography>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label={intl.formatMessage({ id: 'role-name' })}
                            {...customRoleForm.register('name')}
                            error={!!customRoleForm.formState.errors.name}
                            helperText={customRoleForm.formState.errors.name?.message}
                          />
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              label={intl.formatMessage({ id: 'description-arabic' })}
                              {...customRoleForm.register('descriptionArabic')}
                              error={!!customRoleForm.formState.errors.descriptionArabic}
                              helperText={customRoleForm.formState.errors.descriptionArabic?.message}
                            />
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              label={intl.formatMessage({ id: 'description-english' })}
                              {...customRoleForm.register('descriptionEnglish')}
                              error={!!customRoleForm.formState.errors.descriptionEnglish}
                              helperText={customRoleForm.formState.errors.descriptionEnglish?.message}
                            />
                          </Stack>
                          <Controller
                            control={customRoleForm.control}
                            name="permissionIds"
                            render={({ field }) => (
                              <PermissionSelector
                                permissions={permissions}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={permissionsLoading}
                              />
                            )}
                          />
                          {Boolean(permissionsError) && !permissionsLoading && (
                            <Alert severity="error">
                              <FormattedMessage id="administration-load-error" defaultMessage="Unable to load permissions." />
                            </Alert>
                          )}
                          {customRolePermissionError && (
                            <Typography variant="caption" color="error">
                              {typeof customRolePermissionError === 'string'
                                ? customRolePermissionError
                                : intl.formatMessage({ id: 'select-at-least-one-permission' })}
                            </Typography>
                          )}
                          {permissionsLoading && <Loader />}
                        </Stack>
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Paper>
            </>
          )}
          {dialog?.mode === 'reset' && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="password"
                label={intl.formatMessage({ id: 'new-password' })}
                {...resetForm.register('newPassword')}
                error={!!resetForm.formState.errors.newPassword}
                helperText={resetForm.formState.errors.newPassword?.message}
              />
              <TextField
                fullWidth
                type="password"
                label={intl.formatMessage({ id: 'confirm-password' })}
                {...resetForm.register('confirmPassword')}
                error={!!resetForm.formState.errors.confirmPassword}
                helperText={resetForm.formState.errors.confirmPassword?.message}
              />
            </Stack>
          )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose} disabled={isSaving}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            <FormattedMessage id={isSaving ? 'loading' : dialog?.mode === 'create' ? 'create-user' : 'save'} />
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
