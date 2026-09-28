import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';

import type { EntitySearchGroup } from './useGlobalEntitySearch';
import type { GlobalSearchEntry } from './search-navigation-utils';

type Props = {
  quickActions: GlobalSearchEntry[];
  entries: GlobalSearchEntry[];
  entityGroups: EntitySearchGroup[];
  meaningfulQuery: boolean;
  loading: boolean;
  selectedIndex: number;
  onSelect: (entry: GlobalSearchEntry) => void;
  onHover: (index: number) => void;
};

export default function GlobalSearchResults({ quickActions, entries, entityGroups, meaningfulQuery, loading, selectedIndex, onSelect, onHover }: Props) {
  let resultIndex = 0;
  const renderEntry = (entry: GlobalSearchEntry) => {
    const index = resultIndex++;
    const Icon = entry.icon;
    return (
      <MenuItem key={entry.id} selected={index === selectedIndex} onMouseEnter={() => onHover(index)} onClick={() => onSelect(entry)} role="option" aria-selected={index === selectedIndex}>
        {Icon && <ListItemIcon sx={{ minWidth: 36 }}><Icon size={19} stroke={1.5} /></ListItemIcon>}
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap>{entry.title}</Typography>
          {(entry.subtitle || entry.detail || entry.parentTitle) && <Typography variant="caption" color="text.secondary" noWrap>{entry.subtitle || entry.parentTitle || entry.detail}</Typography>}
        </Box>
      </MenuItem>
    );
  };
  return (
    <Paper elevation={8} sx={{ mt: 1, overflowY: 'auto', maxHeight: 'min(70vh, 420px)', width: '100%' }}>
      {quickActions.length > 0 && <>
        <Box sx={{ px: 2, pt: 1.5 }}><Typography variant="overline" color="text.secondary"><FormattedMessage id="global-search-quick-actions" defaultMessage="Quick Actions" /></Typography></Box>
        <MenuList dense aria-label="Quick actions">{quickActions.map(renderEntry)}</MenuList>
      </>}
      {entries.length > 0 && <>
        <Box sx={{ px: 2, pt: 1.5 }}><Typography variant="overline" color="text.secondary"><FormattedMessage id="global-search-navigation" defaultMessage="Navigation" /></Typography></Box>
        <MenuList dense aria-label="Global search results">{entries.map(renderEntry)}</MenuList>
      </>}
      {entityGroups.map((group) => {
        if (!meaningfulQuery || (!group.loading && group.entries.length === 0)) return null;
        const label = group.kind === 'party'
          ? 'global-search-parties'
          : group.kind === 'item'
            ? 'global-search-items'
            : group.kind === 'worker'
              ? 'global-search-workers'
              : group.kind === 'sales-invoice'
                ? 'global-search-sales-invoices'
                : 'global-search-purchase-invoices';
        const defaultLabel = group.kind === 'party'
          ? 'Customers & Suppliers'
          : group.kind === 'item'
            ? 'Items'
            : group.kind === 'worker'
              ? 'Workers'
              : group.kind === 'sales-invoice'
                ? 'Sales Invoices'
                : 'Purchase Invoices';
        return <Box key={group.kind}>
          <Box sx={{ px: 2, pt: 1.5 }}><Typography variant="overline" color="text.secondary"><FormattedMessage id={label} defaultMessage={defaultLabel} /></Typography></Box>
          {group.loading ? <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, pb: 1 }}><FormattedMessage id="global-search-searching" defaultMessage="Searching…" /></Typography> : <MenuList dense>{group.entries.map(renderEntry)}</MenuList>}
        </Box>;
      })}
      {meaningfulQuery && !loading && entries.length === 0 && entityGroups.every((group) => group.entries.length === 0) && <MenuItem disabled><Typography color="text.secondary"><FormattedMessage id="global-search-no-results" defaultMessage="No results" /></Typography></MenuItem>}
    </Paper>
  );
}
