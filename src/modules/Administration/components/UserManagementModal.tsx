import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconBan, IconCalendar, IconClock, IconInfoCircle, IconMail, IconPhone, IconTrash, IconUser, IconX } from '@tabler/icons-react';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from './PermissionGuard';
import RoleSelector from './RoleSelector';
import UserStatusChip from './UserStatusChip';
import { activateUser, assignUserRoles, deactivateUser, deleteUser, updateUser } from '../api/administrationApi';
import { updateUserSchema } from '../schemas/user.schema';
import type { UpdateUserRequest, UserDto } from '../types/administration.types';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';

type UserManagementModalProps = {
  user: UserDto | null;
  roles: any[];
  onClose: () => void;
  onSaved: () => void;
};

export default function UserManagementModal({ user, roles, onClose, onSaved }: UserManagementModalProps) {
  const intl = useIntl();
  const { user: currentUser } = useAuth();
  const dispatch = useDispatch();
  const [tabIndex, setTabIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(user);

  const updateForm = useForm<UpdateUserRequest>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
      rowVersion: user?.rowVersion ?? ''
    }
  });

  const rolesForm = useForm<{ roleIds: string[] }>({
    defaultValues: { roleIds: user?.roles.map((role) => role.id) ?? [] }
  });

  useEffect(() => {
    if (!user) return;
    setActiveUser(user);
    updateForm.reset({
      displayName: user.displayName,
      email: user.email,
      rowVersion: user.rowVersion
    });
    rolesForm.reset({
      roleIds: user.roles.map((role) => role.id)
    });
    setTabIndex(0);
  }, [rolesForm, updateForm, user]);

  if (!user || !activeUser) return null;

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

  const persist = async <T,>(action: () => Promise<T>, onSuccess?: (result: T) => void) => {
    try {
      setIsSaving(true);
      const result = await action();
      onSuccess?.(result);
      onSaved();
    } catch (error) {
      notifyError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (tabIndex === 0) {
      void updateForm.handleSubmit((values) =>
        persist(
          () => updateUser(activeUser.id, values),
          (updated) => {
            setActiveUser(updated);
            updateForm.reset({
              displayName: updated.displayName,
              email: updated.email,
              rowVersion: updated.rowVersion
            });
            rolesForm.reset({
              roleIds: updated.roles.map((role) => role.id)
            });
          }
        )
      )();
    } else {
      void persist(
        () => assignUserRoles(activeUser.id, rolesForm.getValues()),
        (updated) => {
          setActiveUser(updated);
          updateForm.reset({
            displayName: updated.displayName,
            email: updated.email,
            rowVersion: updated.rowVersion
          });
          rolesForm.reset({
            roleIds: updated.roles.map((role) => role.id)
          });
        }
      );
    }
  };

  const toggleStatus = () => {
    void persist(
      () => (activeUser.isActive ? deactivateUser(activeUser.id) : activateUser(activeUser.id)),
      () => {
        setActiveUser((current) => (current ? { ...current, isActive: !current.isActive } : current));
      }
    );
  };

  const canDeleteUser = Boolean(currentUser?.isSystemOwner && !activeUser.isSystemOwner && activeUser.id !== currentUser.id);

  const handleDelete = () => {
    setDeleteConfirmOpen(false);
    void persist(
      () => deleteUser(activeUser.id),
      () => {
        onClose();
      }
    );
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]} ${parts[1][0]}`;
    return name.slice(0, 2);
  };

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            <FormattedMessage id="manage-user-data" />
          </Typography>
          <UserStatusChip isActive={activeUser.isActive} />
        </Stack>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </Box>
      <Divider />

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ pt: 4, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            sx={{ width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', fontSize: '2rem', fontWeight: 'bold', mb: 2 }}
          >
            {getInitials(activeUser.displayName)}
          </Avatar>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {activeUser.displayName}
          </Typography>
          {activeUser.isSystemOwner && (
            <Chip
              size="small"
              color="warning"
              label={intl.formatMessage({ id: 'system-owner', defaultMessage: 'System owner' })}
              sx={{ mb: 1, fontWeight: 700 }}
            />
          )}
          <Typography variant="body2" color="text.secondary">
            {activeUser.roles.map((r) => r.name).join(' • ') || '-'}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={tabIndex} onChange={(_, nv) => setTabIndex(nv)} aria-label="user management tabs">
            <Tab label={<FormattedMessage id="basic-information" />} />
            <Tab label={<FormattedMessage id="roles-and-permissions" />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabIndex === 0 && (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="name" />}
                    {...updateForm.register('displayName')}
                    error={!!updateForm.formState.errors.displayName}
                    helperText={updateForm.formState.errors.displayName?.message}
                    InputProps={{
                      endAdornment: <IconUser size={20} color="gray" />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="email" />}
                    {...updateForm.register('email')}
                    error={!!updateForm.formState.errors.email}
                    helperText={updateForm.formState.errors.email?.message}
                    InputProps={{
                      endAdornment: <IconMail size={20} color="gray" />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="phone" />}
                    defaultValue="-"
                    InputProps={{
                      readOnly: true,
                      endAdornment: <IconPhone size={20} color="gray" />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="join-date" />}
                    defaultValue={activeUser.createdAtUtc ? new Date(activeUser.createdAtUtc).toLocaleDateString() : '-'}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <IconCalendar size={20} color="gray" />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={<FormattedMessage id="last-login" />}
                    defaultValue={activeUser.lastLoginAtUtc ? new Date(activeUser.lastLoginAtUtc).toLocaleString() : '-'}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <IconClock size={20} color="gray" />
                    }}
                  />
                </Grid>
              </Grid>

              <Alert
                icon={<IconInfoCircle size={24} />}
                severity="info"
                sx={{ bgcolor: 'primary.lighter', color: 'primary.dark', '& .MuiAlert-icon': { color: 'primary.main' } }}
              >
                <FormattedMessage id="user-roles-info-alert" />
              </Alert>
            </Stack>
          )}

          {tabIndex === 1 && (
            <Controller
              control={rolesForm.control}
              name="roleIds"
              render={({ field }) => <RoleSelector roles={roles} value={field.value} onChange={field.onChange} />}
            />
          )}
        </Box>
      </DialogContent>

      <Box
        sx={{ p: 3, pt: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <PermissionGuard
            permission={activeUser.isActive ? ADMINISTRATION_PERMISSIONS.usersDeactivate : ADMINISTRATION_PERMISSIONS.usersActivate}
          >
            <Button
              color={activeUser.isActive ? 'error' : 'success'}
              onClick={toggleStatus}
              disabled={isSaving}
              startIcon={activeUser.isActive ? <IconBan size={20} /> : undefined}
            >
              <FormattedMessage id={activeUser.isActive ? 'deactivate-account' : 'activate'} />
            </Button>
          </PermissionGuard>
          {canDeleteUser && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isSaving}
              startIcon={<IconTrash size={20} />}
            >
              <FormattedMessage id="delete-user" />
            </Button>
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} disabled={isSaving} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving}>
            <FormattedMessage id={isSaving ? 'loading' : 'save'} />
          </Button>
        </Stack>
      </Box>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} keepMounted maxWidth="xs" fullWidth>
        <DialogTitle>
          <FormattedMessage id="confirm-delete-user" />
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="confirm-delete-user-description" values={{ name: activeUser.displayName }} />
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={isSaving}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isSaving} startIcon={<IconTrash size={18} />}>
            <FormattedMessage id="delete" />
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
