import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIntl } from 'react-intl';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconAdjustments, IconChevronDown, IconLock, IconLogout, IconUser } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useAuth from 'hooks/useAuth';

export default function ProfileSection() {
  const theme = useTheme();
  const intl = useIntl();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);

  const initials = (user?.name ?? 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: ReactMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Chip
        ref={anchorRef}
        onClick={handleToggle}
        clickable
        avatar={<Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>{initials}</Avatar>}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'SAYAD User'}
            </Typography>
            <IconChevronDown size={16} />
          </Stack>
        }
        sx={{ ml: 2, height: 44, px: 0.5 }}
        color="primary"
      />

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: { offset: [0, 14] }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ minWidth: 280 }}>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={0.25}>
                        <Typography variant="subtitle1">{user?.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.email}
                        </Typography>
                      </Stack>
                    </Box>
                    <Divider />
                    <List
                      component="nav"
                      sx={{
                        width: '100%',
                        '& .MuiListItemButton-root': { mt: 0.5 }
                      }}
                    >
                      <ListItemButton sx={{ mx: 1, borderRadius: 2 }} onClick={() => navigate('/account/profile')}>
                        <ListItemIcon>
                          <IconUser stroke={1.5} size="20px" />
                        </ListItemIcon>
                        <ListItemText primary={intl.formatMessage({ id: 'my-profile' })} />
                      </ListItemButton>
                      <ListItemButton sx={{ mx: 1, borderRadius: 2 }} onClick={() => navigate('/account/change-password')}>
                        <ListItemIcon>
                          <IconLock stroke={1.5} size="20px" />
                        </ListItemIcon>
                        <ListItemText primary={intl.formatMessage({ id: 'change-password' })} />
                      </ListItemButton>
                      <ListItemButton sx={{ mx: 1, borderRadius: 2 }} onClick={() => navigate('/account/preferences')}>
                        <ListItemIcon>
                          <IconAdjustments stroke={1.5} size="20px" />
                        </ListItemIcon>
                        <ListItemText primary={intl.formatMessage({ id: 'appearance-language' })} />
                      </ListItemButton>
                      <Divider sx={{ mx: 1, my: 1 }} />
                      <ListItemButton sx={{ mx: 1, borderRadius: 2 }} onClick={handleLogout}>
                        <ListItemIcon>
                          <IconLogout stroke={1.5} size="20px" />
                        </ListItemIcon>
                        <ListItemText primary={intl.formatMessage({ id: 'logout' })} />
                      </ListItemButton>
                    </List>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
