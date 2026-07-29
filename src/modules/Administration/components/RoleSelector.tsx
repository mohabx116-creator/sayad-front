import type { ReactNode } from 'react';
import { useMemo } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';

import type { RoleDto } from '../types/administration.types';
import { getBilingualRoleLabel } from '../utils/access-labels';

type RoleSelectorProps = {
  roles: RoleDto[];
  value: string[];
  onChange: (roleIds: string[]) => void;
  labelId?: string;
  helperText?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  allowInactiveSelectedRoles?: boolean;
};

function getRoleSummary(role: RoleDto, locale: string) {
  return getBilingualRoleLabel(role.descriptionArabic, role.descriptionEnglish, role.name, locale);
}

export default function RoleSelector({
  roles,
  value,
  onChange,
  labelId = 'roles',
  helperText,
  error,
  disabled,
  allowInactiveSelectedRoles = false
}: RoleSelectorProps) {
  const intl = useIntl();
  const selectedRoles = useMemo(() => roles.filter((role) => value.includes(role.id)), [roles, value]);
  const selectableRoles = useMemo(
    () => roles.filter((role) => role.isActive || (allowInactiveSelectedRoles && value.includes(role.id))),
    [allowInactiveSelectedRoles, roles, value]
  );

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={selectableRoles}
      value={selectedRoles}
      disabled={disabled}
      onChange={(_, nextValue) => onChange(Array.from(new Set(nextValue.map((role) => role.id))))}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      getOptionLabel={(role) => getRoleSummary(role, intl.locale)}
      renderTags={(tagValue, getTagProps) => (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {tagValue.map((role, index) => (
            <Chip
              {...getTagProps({ index })}
              key={role.id}
              label={getRoleSummary(role, intl.locale)}
              size="small"
              color={role.isSystem ? 'warning' : role.isActive ? 'primary' : 'default'}
              variant={role.isActive ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>
      )}
      renderOption={(props, role, { selected }) => (
        <Box component="li" {...props} key={role.id}>
          <Checkbox checked={selected} sx={{ mr: 1 }} />
          <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                {getRoleSummary(role, intl.locale)}
              </Typography>
              {role.isSystem && (
                <Chip size="small" color="warning" label={<FormattedMessage id="system-role" />} sx={{ height: 20 }} />
              )}
              {!role.isActive && (
                <Chip size="small" variant="outlined" label={<FormattedMessage id="inactive" />} sx={{ height: 20 }} />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap>
              {getRoleSummary(role, intl.locale)}
            </Typography>
          </Stack>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<FormattedMessage id={labelId} />}
          placeholder={intl.formatMessage({ id: 'search-role-placeholder' })}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
}
