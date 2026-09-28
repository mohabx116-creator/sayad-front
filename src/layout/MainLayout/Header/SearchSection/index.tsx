import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

import menuItems from 'menu-items';
import useAuth from 'hooks/useAuth';
import Transitions from 'ui-component/extended/Transitions';

import GlobalSearchResults from './GlobalSearchResults';
import { flattenSearchableNavigation, searchNavigation, type GlobalNavigationEntry } from './search-navigation-utils';

interface HeaderAvatarProps extends AvatarProps {
  children: ReactNode;
}

function HeaderAvatar({ children, ref, ...others }: HeaderAvatarProps) {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      variant="rounded"
      sx={{
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        color: theme.vars.palette.secondary.dark,
        background: theme.vars.palette.secondary.light,
        '&:hover': {
          color: theme.vars.palette.secondary.light,
          background: theme.vars.palette.secondary.dark
        },
        ...theme.applyStyles('dark', {
          color: theme.vars.palette.secondary.main,
          background: theme.vars.palette.dark.main,
          '&:hover': {
            color: theme.vars.palette.secondary.light,
            background: theme.vars.palette.secondary.main
          }
        })
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  placeholder: string;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

function SearchInput({ value, onChange, onFocus, onKeyDown, inputRef, placeholder, mobile, onCloseMobile }: SearchInputProps) {
  const theme = useTheme();
  const input = (
    <OutlinedInput
      id="input-search-header"
      inputRef={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      startAdornment={
        <InputAdornment position="start">
          <IconSearch stroke={1.5} size="16px" />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end">
          <HeaderAvatar>
            <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
          </HeaderAvatar>
          {mobile && (
            <Box sx={{ ml: 2 }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  bgcolor: 'orange.light',
                  color: 'orange.dark',
                  '&:hover': { bgcolor: 'orange.dark', color: 'orange.light' },
                  ...theme.applyStyles('dark', { bgcolor: theme.vars.palette.dark.main })
                }}
                onClick={onCloseMobile}
              >
                <IconX stroke={1.5} size="20px" />
              </Avatar>
            </Box>
          )}
        </InputAdornment>
      }
      aria-label="Search SAYAD navigation"
      aria-controls="global-search-results"
      slotProps={{ input: { sx: { bgcolor: 'transparent', pl: 0.5 } } }}
      sx={mobile ? { width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' } : { width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
    />
  );

  return input;
}

export default function SearchSection() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileAnchorRef = useRef<HTMLDivElement>(null);
  const desktopAnchorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const entries = useMemo(() => flattenSearchableNavigation(menuItems.items, intl, user), [intl, user]);
  const results = useMemo(() => searchNavigation(entries, query), [entries, query]);

  const close = () => {
    setOpen(false);
    setMobileOpen(false);
    setSelectedIndex(0);
  };

  const clearAndClose = () => {
    setQuery('');
    close();
  };

  const selectEntry = (entry: GlobalNavigationEntry) => {
    navigate(entry.route);
    clearAndClose();
  };

  const handleClickAway = () => {
    clearAndClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
    } else if (event.key === 'Enter' && results[selectedIndex]) {
      event.preventDefault();
      selectEntry(results[selectedIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      clearAndClose();
    }
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) {
          clearAndClose();
          return;
        }

        setOpen(true);
        const input = window.matchMedia('(max-width: 899px)').matches ? mobileInputRef.current : desktopInputRef.current;
        if (window.matchMedia('(max-width: 899px)').matches) setMobileOpen(true);
        window.requestAnimationFrame(() => input?.focus());
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [open]);

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getInputProps = (inputRef: React.RefObject<HTMLInputElement | null>) => ({
    value: query,
    onChange: setQuery,
    onFocus: () => setOpen(true),
    onKeyDown: handleKeyDown,
    inputRef,
    placeholder: intl.formatMessage({ id: 'global-search-placeholder', defaultMessage: 'Search in SAYAD...' })
  });

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            clearAndClose();
          }
        }}
      >
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <>
            <Box ref={mobileAnchorRef} sx={{ ml: 2 }}>
              <HeaderAvatar
                onClick={() => {
                  if (mobileOpen) {
                    clearAndClose();
                  } else {
                    setMobileOpen(true);
                  }
                }}
              >
                <IconSearch stroke={1.5} size="19.2px" />
              </HeaderAvatar>
            </Box>
            <Popper
              open={mobileOpen}
              anchorEl={mobileAnchorRef.current}
              transition
              sx={{ zIndex: 1100, width: '99%', top: '-55px !important', px: { xs: 1.25, sm: 1.5 } }}
            >
              {({ TransitionProps }) => (
                <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                  <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                    <Box sx={{ p: 2 }}>
                      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Grid size="grow">
                          <SearchInput
                            {...getInputProps(mobileInputRef)}
                            mobile
                            onCloseMobile={() => {
                              clearAndClose();
                              setMobileOpen(false);
                            }}
                          />
                          {open && (
                            <GlobalSearchResults
                              entries={results}
                              selectedIndex={selectedIndex}
                              onSelect={selectEntry}
                              onHover={setSelectedIndex}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Transitions>
              )}
            </Popper>
          </>
        </Box>
        <Box ref={desktopAnchorRef} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
          <SearchInput {...getInputProps(desktopInputRef)} />
          <Popper
            open={open}
            anchorEl={desktopAnchorRef.current}
            placement="bottom-start"
            sx={{ zIndex: 1200, width: { md: 250, lg: 434 } }}
          >
            <GlobalSearchResults entries={results} selectedIndex={selectedIndex} onSelect={selectEntry} onHover={setSelectedIndex} />
          </Popper>
        </Box>
      </Box>
    </ClickAwayListener>
  );
}
