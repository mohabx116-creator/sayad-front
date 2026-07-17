import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconAlertTriangle } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { useUsers } from 'modules/Administration/hooks/useAdministration';
import { useSystemOwner, useSystemOwnerIntegrity } from '../hooks/useSystem';
import { rotateSystemOwner } from '../api/systemApi';
import type { RotateSystemOwnerRequest } from '../types/system.types';

const rotationSchema = z.object({
  targetUserId: z.string().min(1, 'Target user is required.'),
  currentOwnerPassword: z.string().min(1, 'Current owner password is required.'),
  reason: z.string().min(1, 'Reason is required.'),
  confirmationText: z.string().min(1, 'Confirmation text is required.')
});

export default function SystemDangerZonePage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { owner, isLoading: ownerLoading, mutate: mutateOwner } = useSystemOwner();
  const { integrity, isLoading: integrityLoading, mutate: mutateIntegrity } = useSystemOwnerIntegrity();
  const { items: users, isLoading: usersLoading, mutate: mutateUsers } = useUsers({ page: 1, pageSize: 100, isActive: true, isLocked: false });
  const { register, handleSubmit, watch, setValue, formState } = useForm<RotateSystemOwnerRequest>({
    resolver: zodResolver(rotationSchema),
    values: { targetUserId: '', currentOwnerPassword: '', reason: '', confirmationText: '' }
  });

  const targetUserId = watch('targetUserId');
  const targetUser = useMemo(() => users.find((user) => user.id === targetUserId) ?? null, [targetUserId, users]);

  useEffect(() => {
    if (!targetUserId) {
      const nextTarget = users.find((user) => !user.isSystemOwner);
      if (nextTarget) {
        setValue('targetUserId', nextTarget.id);
      }
    }
  }, [setValue, targetUserId, users]);

  const targetUsers = users.filter((user) => !user.isSystemOwner);

  const submit = handleSubmit(async (values) => {
    try {
      await rotateSystemOwner(values);
      await Promise.all([mutateOwner(), mutateIntegrity(), mutateUsers()]);
      dispatch(
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'owner-rotation-success' }),
          variant: 'alert',
          severity: 'success'
        })
      );
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error instanceof Error ? error.message : intl.formatMessage({ id: 'administration-action-failed' }),
          variant: 'alert',
          severity: 'error'
        })
      );
    }
  });

  if (ownerLoading || integrityLoading || usersLoading) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumbs custom heading="system-danger-zone" links={[{ title: 'system-administration' }, { title: 'system-danger-zone' }]} />
      <MainCard
        title={<FormattedMessage id="system-danger-zone" />}
        secondary={<Chip color="warning" icon={<IconAlertTriangle size={16} />} label={<FormattedMessage id="danger-zone" />} />}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h5">
              <FormattedMessage id="current-system-owner" />
            </Typography>
            <Typography>{owner?.displayName ?? '-'}</Typography>
            <Typography color="text.secondary">{owner?.email ?? '-'}</Typography>
            <Typography variant="body2" color={integrity?.isHealthy ? 'success.main' : 'warning.main'}>
              <FormattedMessage id="owner-count" />: {integrity?.ownerCount ?? 0}
            </Typography>
            {integrity && !integrity.isHealthy && integrity.issues.length > 0 && (
              <Stack spacing={0.5}>
                {integrity.issues.map((issue) => (
                  <Typography key={issue} variant="body2" color="error">
                    {issue}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>

          <Stack spacing={2}>
            <TextField select label={intl.formatMessage({ id: 'target-user' })} {...register('targetUserId')}>
              {targetUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.displayName} ({user.email})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="password"
              label={intl.formatMessage({ id: 'current-owner-password' })}
              error={!!formState.errors.currentOwnerPassword}
              helperText={formState.errors.currentOwnerPassword?.message}
              {...register('currentOwnerPassword')}
            />
            <TextField
              label={intl.formatMessage({ id: 'rotation-reason' })}
              error={!!formState.errors.reason}
              helperText={formState.errors.reason?.message}
              {...register('reason')}
            />
            <TextField
              label={intl.formatMessage({ id: 'exact-confirmation' })}
              error={!!formState.errors.confirmationText}
              helperText={targetUser ? intl.formatMessage({ id: 'type-target-email-to-confirm' }, { email: targetUser.email }) : formState.errors.confirmationText?.message}
              {...register('confirmationText')}
            />
            <Button variant="contained" color="warning" onClick={submit} disabled={!targetUser}>
              <FormattedMessage id="rotate-ownership" />
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
