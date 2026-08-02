import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { useIntl } from 'react-intl';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconBell } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

export default function NotificationSection() {
  const theme = useTheme();
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: ReactMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
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
      <Box sx={{ ml: 2 }}>
        <Avatar
          variant="rounded"
          ref={anchorRef}
          onClick={handleToggle}
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.warning.dark,
            background: theme.vars.palette.warning.light,
            '&:hover, &[aria-controls="menu-list-grow"]': {
              color: theme.vars.palette.warning.light,
              background: theme.vars.palette.warning.dark
            },
            ...theme.applyStyles('dark', {
              color: theme.vars.palette.warning.dark,
              background: theme.vars.palette.dark.main,
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: theme.vars.palette.grey[800],
                background: theme.vars.palette.warning.dark
              }
            })
          }}
        >
          <IconBell stroke={1.5} size="20px" />
        </Avatar>
      </Box>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ maxWidth: 340 }}>
                    <Stack spacing={2} sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                        <Typography variant="h5">{intl.formatMessage({ id: 'notifications-title' })}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          0
                        </Typography>
                      </Stack>
                      <Divider />
                      <Stack spacing={1.25} sx={{ py: 1 }}>
                        <Typography variant="subtitle1">{intl.formatMessage({ id: 'no-notifications-yet' })}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {intl.formatMessage({ id: 'notifications-empty-description' })}
                        </Typography>
                      </Stack>
                      <Button variant="outlined" disabled>
                        {intl.formatMessage({ id: 'notifications-deferred' })}
                      </Button>
                    </Stack>
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
