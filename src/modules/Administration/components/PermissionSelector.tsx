import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
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
import {
  getBilingualLabel,
  getBilingualPermissionLabel,
  getPermissionPathInfo,
  getPermissionResourceLabel,
  getPermissionRoutePath,
  getPermissionScopeHelper,
  getPermissionScopeLabel
} from '../utils/access-labels';

type PermissionSelectorProps = {
  permissions: PermissionDto[];
  value: string[];
  onChange: (permissionIds: string[]) => void;
  disabled?: boolean;
};

type PermissionGroup = {
  module: string;
  moduleLabel: string;
  modulePermissions: PermissionDto[];
  pageGroups: PermissionPageGroup[];
};

type PermissionPageGroup = {
  pageKey: string;
  pageLabel: string;
  routePath: string;
  pagePermissions: PermissionDto[];
  actionPermissions: PermissionDto[];
};

function containsQuery(permission: PermissionDto, query: string, isArabic: boolean) {
  if (!query) return true;

  const routePath = getPermissionRoutePath(permission.code);
  const scopeInfo = getPermissionPathInfo(permission.code);
  const fields = [
    permission.code,
    permission.module,
    permission.nameArabic,
    permission.nameEnglish,
    permission.descriptionArabic,
    permission.descriptionEnglish,
    routePath,
    scopeInfo.scope
  ];

  return fields.some((field) => field?.toLowerCase().includes(query) ?? false) || (isArabic ? permission.nameArabic : permission.nameEnglish).toLowerCase().includes(query);
}

function getScopeAccent(scope: ReturnType<typeof getPermissionPathInfo>['scope']): 'info' | 'secondary' | 'warning' {
  if (scope === 'module') return 'info';
  if (scope === 'page') return 'secondary';
  return 'warning';
}

export default function PermissionSelector({ permissions, value, onChange, disabled }: PermissionSelectorProps) {
  const intl = useIntl();
  const isArabic = intl.locale.startsWith('ar');
  const [search, setSearch] = useState('');

  const groups = useMemo<PermissionGroup[]>(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const grouped = permissions
      .filter((permission) => containsQuery(permission, normalizedQuery, isArabic))
      .reduce<Record<string, { moduleLabel: string; modulePermissions: PermissionDto[]; pageMap: Record<string, PermissionPageGroup> }>>((acc, permission) => {
        const moduleKey = permission.module || 'General';
        const pathInfo = getPermissionPathInfo(permission.code);
        const moduleLabel = getBilingualLabel(moduleKey, intl.locale);

        if (!acc[moduleKey]) {
          acc[moduleKey] = {
            moduleLabel,
            modulePermissions: [],
            pageMap: {}
          };
        }

        if (pathInfo.scope === 'module' || !pathInfo.resourceKey) {
          acc[moduleKey].modulePermissions.push(permission);
          return acc;
        }

        const pageKey = `${pathInfo.moduleKey}.${pathInfo.resourceKey}`;

        if (!acc[moduleKey].pageMap[pageKey]) {
          acc[moduleKey].pageMap[pageKey] = {
            pageKey,
            pageLabel: getPermissionResourceLabel(permission.code, intl.locale),
            routePath: getPermissionRoutePath(permission.code),
            pagePermissions: [],
            actionPermissions: []
          };
        }

        if (pathInfo.scope === 'page') {
          acc[moduleKey].pageMap[pageKey].pagePermissions.push(permission);
        } else {
          acc[moduleKey].pageMap[pageKey].actionPermissions.push(permission);
        }

        return acc;
      }, {});

    return Object.entries(grouped)
      .sort(([moduleA, groupA], [moduleB, groupB]) => {
        const labelComparison = groupA.moduleLabel.localeCompare(groupB.moduleLabel, intl.locale);
        return labelComparison !== 0 ? labelComparison : moduleA.localeCompare(moduleB, intl.locale);
      })
      .map(([module, group]) => {
        const modulePermissions = group.modulePermissions.slice().sort((a, b) => {
          const labelA = getBilingualPermissionLabel(a.nameArabic, a.nameEnglish, intl.locale);
          const labelB = getBilingualPermissionLabel(b.nameArabic, b.nameEnglish, intl.locale);
          return labelA.localeCompare(labelB, intl.locale);
        });

        const pageGroups = Object.values(group.pageMap)
          .map((pageGroup) => ({
            ...pageGroup,
            pagePermissions: pageGroup.pagePermissions.slice().sort((a, b) => {
              const labelA = getBilingualPermissionLabel(a.nameArabic, a.nameEnglish, intl.locale);
              const labelB = getBilingualPermissionLabel(b.nameArabic, b.nameEnglish, intl.locale);
              return labelA.localeCompare(labelB, intl.locale);
            }),
            actionPermissions: pageGroup.actionPermissions.slice().sort((a, b) => {
              const labelA = getBilingualPermissionLabel(a.nameArabic, a.nameEnglish, intl.locale);
              const labelB = getBilingualPermissionLabel(b.nameArabic, b.nameEnglish, intl.locale);
              return labelA.localeCompare(labelB, intl.locale);
            })
          }))
          .sort((a, b) => a.pageLabel.localeCompare(b.pageLabel, intl.locale));

        return {
          module,
          moduleLabel: group.moduleLabel,
          modulePermissions,
          pageGroups
        };
      });
  }, [intl.locale, isArabic, permissions, search]);

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

  const renderPermissionCard = (permission: PermissionDto) => {
    const pathInfo = getPermissionPathInfo(permission.code);
    const scopeLabel = getPermissionScopeLabel(pathInfo.scope, intl.locale);
    const scopeHelp = getPermissionScopeHelper(pathInfo.scope, intl.locale);
    const permissionLabel = getBilingualPermissionLabel(permission.nameArabic, permission.nameEnglish, intl.locale);
    const description = isArabic ? permission.descriptionArabic : permission.descriptionEnglish;
    const routePath = getPermissionRoutePath(permission.code);
    const isSelected = value.includes(permission.id);
    const accent = getScopeAccent(pathInfo.scope);

    return (
      <Box
        key={permission.id}
        sx={{
          borderRadius: 1.5,
          border: 1,
          borderColor: isSelected ? `${accent}.main` : 'divider',
          borderInlineStart: 4,
          borderInlineStartColor: `${accent}.main`,
          bgcolor: isSelected ? 'action.hover' : 'background.paper',
          px: 1.5,
          py: 1
        }}
      >
        <FormControlLabel
          disabled={disabled || !permission.isActive}
          control={<Checkbox checked={isSelected} onChange={() => toggleOne(permission.id)} />}
          label={
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" fontWeight={700}>
                  {permissionLabel}
                </Typography>
                <Chip size="small" color={accent} label={scopeLabel} sx={{ height: 20 }} />
                <Chip size="small" label={permission.code} variant="outlined" sx={{ height: 20 }} />
                <Chip size="small" label={routePath} variant="outlined" sx={{ height: 20 }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {scopeHelp}
              </Typography>
              {description && (
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Stack>
          }
          sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
        />
      </Box>
    );
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info" variant="outlined">
        <Typography variant="body2">
          <FormattedMessage id="permissions-hierarchy-note" defaultMessage="Module permissions unlock the whole module, page permissions unlock the route, and action permissions stay exact." />
        </Typography>
      </Alert>

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
            const modulePermissions = group.modulePermissions;
            const pagePermissions = group.pageGroups.flatMap((pageGroup) => pageGroup.pagePermissions);
            const actionPermissions = group.pageGroups.flatMap((pageGroup) => pageGroup.actionPermissions);
            const selectedCount = group.pageGroups.reduce((count, pageGroup) => {
              const pageSelected = pageGroup.pagePermissions.filter((permission) => value.includes(permission.id)).length;
              const actionSelected = pageGroup.actionPermissions.filter((permission) => value.includes(permission.id)).length;
              return count + pageSelected + actionSelected;
            }, modulePermissions.filter((permission) => value.includes(permission.id)).length);
            const allPermissions = [...modulePermissions, ...pagePermissions, ...actionPermissions];
            const allSelected = allPermissions.length > 0 && allPermissions.every((permission) => value.includes(permission.id));
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
                      onChange={() => toggleMany(allPermissions)}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {group.moduleLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCount}/{allPermissions.length} <FormattedMessage id="selected" defaultMessage="selected" />
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end" sx={{ gap: 0.75 }}>
                      <Chip size="small" color="info" variant="outlined" label={`${modulePermissions.length} ${getPermissionScopeLabel('module', intl.locale)}`} />
                      <Chip size="small" color="secondary" variant="outlined" label={`${group.pageGroups.length} ${getPermissionScopeLabel('page', intl.locale)}`} />
                      <Chip size="small" color="warning" variant="outlined" label={`${actionPermissions.length} ${getPermissionScopeLabel('action', intl.locale)}`} />
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack spacing={2}>
                    {modulePermissions.length > 0 && (
                      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5, bgcolor: 'background.paper' }}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip size="small" color="info" label={getPermissionScopeLabel('module', intl.locale)} />
                            <Typography variant="subtitle2" fontWeight={700}>
                              {getPermissionScopeLabel('module', intl.locale)}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {getPermissionScopeHelper('module', intl.locale)}
                          </Typography>
                          <Stack spacing={1}>
                            {modulePermissions.map((permission) => renderPermissionCard(permission))}
                          </Stack>
                        </Stack>
                      </Box>
                    )}

                    {group.pageGroups.length > 0 && (
                      <Stack spacing={1.5}>
                        {group.pageGroups.map((pageGroup) => {
                          const pageSelectedCount = pageGroup.pagePermissions.filter((permission) => value.includes(permission.id)).length;
                          const actionSelectedCount = pageGroup.actionPermissions.filter((permission) => value.includes(permission.id)).length;
                          const pageTotal = pageGroup.pagePermissions.length + pageGroup.actionPermissions.length;

                          return (
                            <Box
                              key={pageGroup.pageKey}
                              sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                p: 1.5,
                                bgcolor: 'background.default'
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                                      {pageGroup.pageLabel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {pageGroup.routePath}
                                    </Typography>
                                  </Box>
                                  <Chip size="small" variant="outlined" label={`${pageTotal} ${intl.formatMessage({ id: 'permissions' })}`} />
                                </Stack>

                                {pageGroup.pagePermissions.length > 0 && (
                                  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.25, bgcolor: 'background.paper' }}>
                                    <Stack spacing={1}>
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Chip size="small" color="secondary" label={getPermissionScopeLabel('page', intl.locale)} />
                                        <Typography variant="subtitle2" fontWeight={700}>
                                          {getPermissionScopeLabel('page', intl.locale)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {pageSelectedCount}/{pageGroup.pagePermissions.length} <FormattedMessage id="selected" defaultMessage="selected" />
                                        </Typography>
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">
                                        {getPermissionScopeHelper('page', intl.locale)}
                                      </Typography>
                                      <Stack spacing={1}>
                                        {pageGroup.pagePermissions.map((permission) => renderPermissionCard(permission))}
                                      </Stack>
                                    </Stack>
                                  </Box>
                                )}

                                {pageGroup.actionPermissions.length > 0 && (
                                  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.25, bgcolor: 'background.paper' }}>
                                    <Stack spacing={1}>
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Chip size="small" color="warning" label={getPermissionScopeLabel('action', intl.locale)} />
                                        <Typography variant="subtitle2" fontWeight={700}>
                                          {getPermissionScopeLabel('action', intl.locale)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {actionSelectedCount}/{pageGroup.actionPermissions.length} <FormattedMessage id="selected" defaultMessage="selected" />
                                        </Typography>
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">
                                        {getPermissionScopeHelper('action', intl.locale)}
                                      </Typography>
                                      <Stack spacing={1}>
                                        {pageGroup.actionPermissions.map((permission) => renderPermissionCard(permission))}
                                      </Stack>
                                    </Stack>
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
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
