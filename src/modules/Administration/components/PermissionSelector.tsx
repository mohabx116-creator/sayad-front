import { useMemo, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { PermissionDto } from '../types/administration.types';
import { getBilingualLabel, getBilingualPermissionLabel } from '../utils/access-labels';

type PermissionSelectorProps = {
  permissions: PermissionDto[];
  value: string[];
  onChange: (permissionIds: string[]) => void;
  disabled?: boolean;
};

type PermissionGroup = {
  module: string;
  permissions: PermissionDto[];
};

function containsQuery(permission: PermissionDto, query: string, isArabic: boolean) {
  if (!query) return true;
  const fields = [
    permission.code,
    permission.module,
    permission.nameArabic,
    permission.nameEnglish,
    permission.descriptionArabic,
    permission.descriptionEnglish
  ];

  return fields.some((field) => field?.toLowerCase().includes(query) ?? false) || (isArabic ? permission.nameArabic : permission.nameEnglish).toLowerCase().includes(query);
}

export default function PermissionSelector({ permissions, value, onChange, disabled }: PermissionSelectorProps) {
  const intl = useIntl();
  const isArabic = intl.locale.startsWith('ar');
  const [search, setSearch] = useState('');

  const groups = useMemo<PermissionGroup[]>(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const grouped = permissions
      .filter((permission) => containsQuery(permission, normalizedQuery, isArabic))
      .reduce<Record<string, PermissionDto[]>>((acc, permission) => {
        const key = permission.module || 'General';
        if (!acc[key]) acc[key] = [];
        acc[key].push(permission);
        return acc;
      }, {});

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((module) => ({
        module,
        permissions: grouped[module].slice().sort((a, b) => {
          const labelA = isArabic ? a.nameArabic : a.nameEnglish;
          const labelB = isArabic ? b.nameArabic : b.nameEnglish;
          return labelA.localeCompare(labelB);
        })
      }));
  }, [isArabic, permissions, search]);

  const toggleMany = (nextPermissions: PermissionDto[]) => {
    const nextIds = nextPermissions.map((permission) => permission.id);
    const allSelected = nextIds.every((permissionId) => value.includes(permissionId));

    if (allSelected) {
      onChange(value.filter((permissionId) => !nextIds.includes(permissionId)));
      return;
    }

    const merged = new Set(value);
    nextIds.forEach((permissionId) => merged.add(permissionId));
    onChange(Array.from(merged));
  };

  const toggleOne = (permissionId: string) => {
    onChange(value.includes(permissionId) ? value.filter((currentId) => currentId !== permissionId) : [...value, permissionId]);
  };

  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={disabled}
        placeholder={intl.formatMessage({ id: 'search-permissions-placeholder', defaultMessage: 'Search permissions' })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={18} />
            </InputAdornment>
          )
        }}
      />

      {groups.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="no-permissions-found" defaultMessage="No permissions found." />
        </Typography>
      ) : (
        <Stack spacing={1}>
          {groups.map((group) => {
            const selectedCount = group.permissions.filter((permission) => value.includes(permission.id)).length;
            const allSelected = group.permissions.length > 0 && selectedCount === group.permissions.length;
            const someSelected = selectedCount > 0 && !allSelected;

            return (
              <Accordion key={group.module} disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      disabled={disabled}
                      onClick={(event) => event.stopPropagation()}
                      onFocus={(event) => event.stopPropagation()}
                      onChange={() => toggleMany(group.permissions)}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {getBilingualLabel(group.module, intl.locale)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCount}/{group.permissions.length} <FormattedMessage id="selected" defaultMessage="selected" />
                      </Typography>
                    </Box>
                    <Chip size="small" label={group.permissions.length} variant="outlined" />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack spacing={1}>
                    {group.permissions.map((permission) => {
                      const permissionLabel = getBilingualPermissionLabel(permission.nameArabic, permission.nameEnglish, intl.locale);
                      const description = isArabic ? permission.descriptionArabic : permission.descriptionEnglish;

                      return (
                        <Box
                          key={permission.id}
                          sx={{
                            borderRadius: 1,
                            border: 1,
                            borderColor: value.includes(permission.id) ? 'primary.main' : 'divider',
                            bgcolor: value.includes(permission.id) ? 'primary.lighter' : 'background.paper',
                            px: 1.5,
                            py: 0.5
                          }}
                        >
                          <FormControlLabel
                            disabled={disabled || !permission.isActive}
                            control={<Checkbox checked={value.includes(permission.id)} onChange={() => toggleOne(permission.id)} />}
                            label={
                              <Stack spacing={0.25}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Typography variant="body2" fontWeight={600}>
                                    {permissionLabel}
                                  </Typography>
                                  <Chip size="small" label={permission.code} variant="outlined" sx={{ height: 20 }} />
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {description}
                                </Typography>
                              </Stack>
                            }
                            sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
