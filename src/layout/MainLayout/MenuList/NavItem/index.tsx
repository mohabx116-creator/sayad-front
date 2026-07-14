import { Activity } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { MenuOrientation, ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';
import { withAlpha } from 'utils/colorUtils';

// third party
import { FormattedMessage } from 'react-intl';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// types
import { LinkTarget, NavItemType } from 'types';

// ==============================|| SIDEBAR MENU LIST ITEMS ||============================== //

interface NavItemProps {
  item: NavItemType;
  level: number;
  isParents?: boolean;
  setSelectedID?: () => void;
}

export default function NavItem({ item, level, isParents = false, setSelectedID }: NavItemProps) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { pathname } = useLocation();
  const {
    state: { menuOrientation, borderRadius, themeDirection }
  } = useConfig();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;
  const isSelected = !!matchPath({ path: item?.link ? item.link : item.url!, end: false }, pathname);

  const Icon = item?.icon!;
  const itemIcon = item?.icon ? (
    <Icon stroke={1.5} size={drawerOpen ? '20px' : '24px'} style={{ ...(isHorizontal && isParents && { fontSize: 20, stroke: '1.5' }) }} />
  ) : (
    <FiberManualRecordIcon sx={{ width: isSelected ? 8 : 6, height: isSelected ? 8 : 6 }} fontSize={level > 0 ? 'inherit' : 'medium'} />
  );

  let itemTarget: LinkTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    if (downMD) handlerDrawerOpen(false);

    if (isParents && setSelectedID) {
      setSelectedID();
    }
  };

  const menuLabel = <FormattedMessage id={item.title} />;

  const itemButton = (
    <ListItemButton
      component={Link}
      to={item.url!}
      target={itemTarget}
      disabled={item.disabled}
      disableRipple={!drawerOpen}
      sx={{
        zIndex: 1201,
        borderRadius: `${borderRadius}px`,
        mb: 0.5,
        alignItems: drawerOpen ? 'center' : 'center',
        ...(drawerOpen && level !== 1 && { ml: `${level * 18}px` }),
        ...(!drawerOpen && { pl: 1.25 }),
        ...((!drawerOpen || level !== 1) && {
          py: level === 1 ? 0 : 1,
          '&:hover': { bgcolor: 'transparent' },
          '&.Mui-selected': {
            '&:hover': { bgcolor: 'transparent' },
            bgcolor: 'transparent'
          }
        })
      }}
      selected={isSelected}
      onClick={() => itemHandler()}
    >
      <ButtonBase aria-label="theme-icon" sx={{ borderRadius: `${borderRadius}px` }} disableRipple={drawerOpen}>
        <ListItemIcon
          sx={{
            minWidth: level === 1 ? 36 : 18,
            color: isSelected ? 'secondary.main' : 'text.primary',
            ...(!drawerOpen &&
              level === 1 && {
                borderRadius: `${borderRadius}px`,
                width: 46,
                height: 46,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { bgcolor: 'secondary.light' },
                ...(isSelected && {
                  bgcolor: 'secondary.light',
                  '&:hover': { bgcolor: 'secondary.light' }
                })
              }),

            // dark overrides
            ...theme.applyStyles('dark', {
              color: isSelected && drawerOpen ? 'text.primary' : 'text.primary',

              ...(!drawerOpen &&
                level === 1 && {
                  '&:hover': { bgcolor: withAlpha(theme.vars.palette.secondary.main, 0.25) },
                  ...(isSelected && {
                    bgcolor: withAlpha(theme.vars.palette.secondary.main, 0.25),
                    '&:hover': { bgcolor: withAlpha(theme.vars.palette.secondary.main, 0.3) }
                  })
                })
            })
          }}
        >
          {itemIcon}
        </ListItemIcon>
      </ButtonBase>

      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <ListItemText
          sx={{ flex: 1, minWidth: 0 }}
          primary={
            <Typography
              variant={isSelected ? 'h5' : 'body1'}
              sx={{
                display: 'block',
                width: '100%',
                minWidth: 0,
                color: 'inherit',
                whiteSpace: 'normal',
                overflow: 'visible',
                textOverflow: 'clip',
                lineHeight: 1.4,
                wordBreak: 'normal',
                overflowWrap: 'normal',
                ...(themeDirection === ThemeDirection.RTL
                  ? {
                      direction: 'rtl',
                      textAlign: 'right'
                    }
                  : {
                      direction: 'ltr',
                      textAlign: 'left'
                    })
              }}
            >
              {menuLabel}
            </Typography>
          }
          secondary={
            item.caption && (
              <Typography
                variant="caption"
                gutterBottom
                sx={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  textTransform: 'capitalize',
                  lineHeight: 1.66
                }}
              >
                <FormattedMessage id={item.caption} />
              </Typography>
            )
          }
        />
      )}

      <Activity mode={drawerOpen && item.chip ? 'visible' : 'hidden'}>
        <Chip
          color={item.chip?.color}
          variant={item.chip?.variant}
          size={item.chip?.size}
          label={item.chip?.label}
          avatar={
            <Activity mode={item.chip?.avatar ? 'visible' : 'hidden'}>
              <Avatar>{item.chip?.avatar}</Avatar>
            </Activity>
          }
        />
      </Activity>
    </ListItemButton>
  );

  return (
    <>
      {!isHorizontal ? (
        !drawerOpen && level === 1 ? (
          <Tooltip title={menuLabel} placement="right" arrow>
            <span style={{ display: 'block' }}>{itemButton}</span>
          </Tooltip>
        ) : (
          itemButton
        )
      ) : (
        <ListItemButton
          component={Link}
          to={item.url!}
          target={itemTarget}
          disabled={item.disabled}
          sx={{
            borderRadius: isParents ? `${borderRadius}px` : 0,
            mb: isParents ? 0 : 0.5,
            alignItems: 'flex-start',
            backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
            py: 1,
            pl: 2,
            mr: isParents ? 1 : 0
          }}
          selected={isSelected}
          onClick={() => itemHandler()}
        >
          <ListItemIcon
            sx={{
              my: 'auto',
              minWidth: !item?.icon ? 18 : 36
            }}
          >
            {itemIcon}
          </ListItemIcon>

          <ListItemText
            sx={{ flex: 1, minWidth: 0, mb: 0.25 }}
            primary={
              <Typography
                variant={isSelected ? 'h5' : 'body1'}
                sx={{
                  display: 'block',
                  width: '100%',
                  minWidth: 0,
                  color: 'inherit',
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  lineHeight: 1.4,
                  wordBreak: 'normal',
                  overflowWrap: 'normal',
                  ...(themeDirection === ThemeDirection.RTL
                    ? {
                        direction: 'rtl',
                        textAlign: 'right'
                      }
                    : {
                        direction: 'ltr',
                        textAlign: 'left'
                      })
                }}
              >
                <FormattedMessage id={item.title} />
              </Typography>
            }
            secondary={
              <Activity mode={item.caption ? 'visible' : 'hidden'}>
                <Typography
                  gutterBottom
                  sx={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'capitalize',
                    lineHeight: 1.66
                  }}
                >
                  {item.caption}
                </Typography>
              </Activity>
            }
          />

          <Activity mode={item.chip ? 'visible' : 'hidden'}>
            <Chip
              color={item.chip?.color}
              variant={item.chip?.variant}
              size={item.chip?.size}
              label={item.chip?.label}
              avatar={
                <Activity mode={item.chip?.avatar ? 'visible' : 'hidden'}>
                  <Avatar>{item.chip?.avatar}</Avatar>
                </Activity>
              }
            />
          </Activity>
        </ListItemButton>
      )}
    </>
  );
}
