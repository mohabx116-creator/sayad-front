import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';

import type { GlobalNavigationEntry } from './search-navigation-utils';

type Props = {
  entries: GlobalNavigationEntry[];
  selectedIndex: number;
  onSelect: (entry: GlobalNavigationEntry) => void;
  onHover: (index: number) => void;
};

export default function GlobalSearchResults({ entries, selectedIndex, onSelect, onHover }: Props) {
  return (
    <Paper elevation={8} sx={{ mt: 1, overflow: 'hidden', width: '100%' }}>
      <Box sx={{ px: 2, pt: 1.5 }}>
        <Typography variant="overline" color="text.secondary">
          <FormattedMessage id="global-search-navigation" defaultMessage="Navigation" />
        </Typography>
      </Box>
      <MenuList dense aria-label="Navigation search results">
        {entries.length ? (
          entries.map((entry, index) => {
            const Icon = entry.icon;
            return (
              <MenuItem
                key={entry.id}
                selected={index === selectedIndex}
                onMouseEnter={() => onHover(index)}
                onClick={() => onSelect(entry)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {Icon && (
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon size={19} stroke={1.5} />
                  </ListItemIcon>
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap>{entry.title}</Typography>
                  {entry.parentTitle && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {entry.parentTitle}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>
            <Typography color="text.secondary">
              <FormattedMessage id="global-search-no-results" defaultMessage="No navigation results" />
            </Typography>
          </MenuItem>
        )}
      </MenuList>
    </Paper>
  );
}
