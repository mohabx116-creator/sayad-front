import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconSearch, IconPlus, IconUserShield, IconDeviceFloppy, IconRotateClockwise2, IconEdit } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from '../components/PermissionGuard';
import PermissionMatrix from '../components/PermissionMatrix';
import { assignRolePermissions, createRole, updateRole } from '../api/administrationApi';
import { usePermissions, useRoles } from '../hooks/useAdministration';
import { createRoleSchema, updateRoleSchema } from '../schemas/role.schema';
import type { CreateRoleRequest, RoleDto, UpdateRoleRequest } from '../types/administration.types';
import { ADMINISTRATION_PERMISSIONS } from '../utils/administration.constants';

type RoleDialogState = { mode: 'create' | 'edit'; role?: RoleDto } | null;

export default function RolesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<RoleDialogState>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Matrix state
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // We fetch all roles without pagination for the sidebar for simplicity,
  // or use a large page size since roles are usually few.
  const { items: roles, isLoading, error, mutate } = useRoles({ page: 1, pageSize: 100, search });
  const { permissions } = usePermissions();

  const selectedRole = roles.find(r => r.id === selectedRoleId) || null;

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    if (selectedRole) {
      setRolePermissions(selectedRole.permissions.map(p => p.id));
    } else {
      setRolePermissions([]);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (permissions.length > 0 && rolePermissions.length > 0) {
      setIsSelectAll(rolePermissions.length === permissions.length);
    } else {
      setIsSelectAll(false);
    }
  }, [rolePermissions, permissions]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSelectAllToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsSelectAll(checked);
    if (checked) {
      setRolePermissions(permissions.map(p => p.id));
    } else {
      setRolePermissions([]);
    }
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      await assignRolePermissions(selectedRole.id, { permissionIds: rolePermissions });
      await mutate();
      notify(intl.formatMessage({ id: 'administration-action-success' }));
    } catch (err) {
      notify(err instanceof Error ? err.message : intl.formatMessage({ id: 'administration-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPermissions = () => {
    if (selectedRole) {
      setRolePermissions(selectedRole.permissions.map(p => p.id));
    }
  };

  const handleRoleSaved = () => {
    setDialog(null);
    mutate();
    notify(intl.formatMessage({ id: 'administration-action-success' }));
  };

  return (
    <>
      <Breadcrumbs custom heading="roles-and-permissions" links={[{ title: 'administration' }, { title: 'roles-and-permissions' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h3" gutterBottom>
            <FormattedMessage id="system-permissions-matrix" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="system-permissions-matrix-desc" />
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<IconRotateClockwise2 size={18} />}
            onClick={resetPermissions}
            disabled={!selectedRole || isSaving}
          >
            <FormattedMessage id="reset-defaults" />
          </Button>
          <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.rolesAssignPermissions}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconDeviceFloppy size={18} />}
              onClick={savePermissions}
              disabled={!selectedRole || isSaving}
            >
              <FormattedMessage id="save-changes" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      {isLoading && <Loader />}
      {error && <Typography color="error"><FormattedMessage id="administration-load-error" /></Typography>}

      <Grid container spacing={3}>
        {/* Main Permissions Matrix (Left side in RTL) */}
        <Grid item xs={12} md={8}>
          <MainCard sx={{ height: '100%', minHeight: 600 }}>
            {selectedRole ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      <FormattedMessage id="permissions-for-role" values={{ role: selectedRole.name }} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="set-access-level-per-module" />
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <FormattedMessage id="select-all" />
                    </Typography>
                    <Switch checked={isSelectAll} onChange={handleSelectAllToggle} color="primary" />
                  </Stack>
                </Box>

                <PermissionMatrix
                  permissions={permissions}
                  value={rolePermissions}
                  onChange={setRolePermissions}
                />
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  <FormattedMessage id="administration-empty-roles" />
                </Typography>
              </Box>
            )}
          </MainCard>
        </Grid>

        {/* Sidebar Roles List (Right side in RTL) */}
        <Grid item xs={12} md={4}>
          <MainCard sx={{ height: '100%' }} content={false}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h4"><FormattedMessage id="functional-roles" /></Typography>
              <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.rolesCreate}>
                <IconButton color="primary" onClick={() => setDialog({ mode: 'create' })}>
                  <IconPlus size={20} />
                </IconButton>
              </PermissionGuard>
            </Box>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={intl.formatMessage({ id: 'search-role-placeholder' })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <List component="nav" sx={{ p: 1 }}>
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <ListItem
                    key={role.id}
                    disablePadding
                    sx={{ mb: 1 }}
                    secondaryAction={
                      isSelected && (
                        <PermissionGuard permission={ADMINISTRATION_PERMISSIONS.rolesUpdate}>
                          <IconButton edge="end" size="small" onClick={() => setDialog({ mode: 'edit', role })}>
                            <IconEdit size={16} />
                          </IconButton>
                        </PermissionGuard>
                      )
                    }
                  >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => setSelectedRoleId(role.id)}
                      sx={{
                        borderRadius: 2,
                        ...(isSelected && {
                          bgcolor: 'primary.lighter',
                          '& .MuiListItemIcon-root': { color: 'primary.main' },
                          '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 'bold' }
                        })
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <IconUserShield size={22} stroke={isSelected ? 2 : 1.5} />
                      </ListItemIcon>
                      <ListItemText
                        primary={role.name}
                        secondary={isSelected ? <Typography variant="caption" color="primary">نشط</Typography> : null}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </MainCard>
        </Grid>
      </Grid>

      <RoleDialog dialog={dialog} onClose={() => setDialog(null)} onSaved={handleRoleSaved} />
    </>
  );
}

function RoleDialog({ dialog, onClose, onSaved }: { dialog: RoleDialogState; onClose: () => void; onSaved: () => void }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
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

  const notifyError = (error: unknown) => {
    dispatch(openSnackbar({ open: true, message: error instanceof Error ? error.message : intl.formatMessage({ id: 'administration-action-failed' }), variant: 'alert', severity: 'error' }));
  };

  const save = async () => {
    if (!dialog) return;
    try {
      setIsSaving(true);
      if (dialog.mode === 'create') await createRole(createForm.getValues());
      if (dialog.mode === 'edit' && dialog.role) await updateRole(dialog.role.id, updateForm.getValues());
      onSaved();
    } catch (err) {
      notifyError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(dialog)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle><FormattedMessage id={dialog?.mode === 'create' ? 'create-role' : 'edit-role'} /></DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {dialog?.mode === 'create' && (
            <>
              <TextField label={intl.formatMessage({ id: 'role-name' })} {...createForm.register('name')} error={!!createForm.formState.errors.name} helperText={createForm.formState.errors.name?.message} />
              <TextField label={intl.formatMessage({ id: 'description-arabic' })} {...createForm.register('descriptionArabic')} />
              <TextField label={intl.formatMessage({ id: 'description-english' })} {...createForm.register('descriptionEnglish')} />
            </>
          )}
          {dialog?.mode === 'edit' && (
            <>
              <TextField label={intl.formatMessage({ id: 'role-name' })} disabled={dialog.role?.isSystem} {...updateForm.register('name')} error={!!updateForm.formState.errors.name} helperText={updateForm.formState.errors.name?.message} />
              <TextField label={intl.formatMessage({ id: 'description-arabic' })} {...updateForm.register('descriptionArabic')} />
              <TextField label={intl.formatMessage({ id: 'description-english' })} {...updateForm.register('descriptionEnglish')} />
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
