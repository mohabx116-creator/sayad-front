import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconX, IconMail, IconPhone, IconCalendar, IconClock, IconInfoCircle, IconBan } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import RoleSelector from './RoleSelector';
import UserStatusChip from './UserStatusChip';
import { assignUserRoles, updateUser, deactivateUser, activateUser } from '../api/administrationApi';
import { updateUserSchema } from '../schemas/user.schema';
import type { UpdateUserRequest, UserDto } from '../types/administration.types';
import PermissionGuard from './PermissionGuard';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';

type UserManagementModalProps = {
  user: UserDto | null;
  roles: any[];
  onClose: () => void;
  onSaved: () => void;
};

export default function UserManagementModal({ user, roles, onClose, onSaved }: UserManagementModalProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [tabIndex, setTabIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const updateForm = useForm<UpdateUserRequest>({
    resolver: zodResolver(updateUserSchema),
    values: {
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
      rowVersion: user?.rowVersion ?? ''
    }
  });

  const rolesForm = useForm<{ roleIds: string[] }>({
    values: { roleIds: user?.roles.map((role) => role.id) ?? [] }
  });

  if (!user) return null;

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

  const handleSave = () => {
    if (tabIndex === 0) {
      // Basic Info Save
      void updateForm.handleSubmit((values) => persist(() => updateUser(user.id, values)))();
    } else {
      // Roles Save
      void persist(() => assignUserRoles(user.id, rolesForm.getValues()));
    }
  };

  const toggleStatus = () => {
    void persist(() => (user.isActive ? deactivateUser(user.id) : activateUser(user.id)));
  };

  // Get Avatar Initials
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
          <UserStatusChip isActive={user.isActive} />
        </Stack>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </Box>
      <Divider />
      
      <DialogContent sx={{ p: 0 }}>
        {/* Header Section */}
        <Box sx={{ pt: 4, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', fontSize: '2rem', fontWeight: 'bold', mb: 2 }}>
            {getInitials(user.displayName)}
          </Avatar>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {user.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.roles.map(r => r.name).join(' • ') || '-'}
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
                    label={<FormattedMessage id="email" />} 
                    defaultValue={user.email} 
                    InputProps={{ 
                      readOnly: true, 
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
                    defaultValue={user.createdAtUtc ? new Date(user.createdAtUtc).toLocaleDateString() : '-'} 
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
                    defaultValue={user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : '-'} 
                    InputProps={{ 
                      readOnly: true, 
                      endAdornment: <IconClock size={20} color="gray" /> 
                    }} 
                  />
                </Grid>
              </Grid>

              <Alert icon={<IconInfoCircle size={24} />} severity="info" sx={{ bgcolor: 'primary.lighter', color: 'primary.dark', '& .MuiAlert-icon': { color: 'primary.main' } }}>
                <FormattedMessage id="user-roles-info-alert" />
              </Alert>
            </Stack>
          )}

          {tabIndex === 1 && (
            <Controller control={rolesForm.control} name="roleIds" render={({ field }) => <RoleSelector roles={roles} value={field.value} onChange={field.onChange} />} />
          )}
        </Box>
      </DialogContent>

      <Box sx={{ p: 3, pt: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PermissionGuard permission={user.isActive ? ADMINISTRATION_PERMISSIONS.usersDeactivate : ADMINISTRATION_PERMISSIONS.usersActivate}>
          <Button 
            color={user.isActive ? 'error' : 'success'} 
            onClick={toggleStatus} 
            disabled={isSaving} 
            startIcon={user.isActive ? <IconBan size={20} /> : undefined}
          >
            <FormattedMessage id={user.isActive ? 'deactivate-account' : 'activate'} />
          </Button>
        </PermissionGuard>
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} disabled={isSaving} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving}>
            <FormattedMessage id={isSaving ? 'loading' : 'save'} />
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}
