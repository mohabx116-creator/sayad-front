// material-ui
import { styled } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

import logo from 'assets/images/logo.png';

const LogoImage = styled('img')(({ theme }) => ({
  width: 'auto',
  objectFit: 'contain',
  transition: 'all 0.3s ease-in-out',
  filter:
    theme.palette.mode === 'dark'
      ? 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.4)) drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.8)) brightness(1.2)'
      : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
  '&:hover': {
    transform: 'scale(1.05)',
    filter:
      theme.palette.mode === 'dark'
        ? 'drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.6)) drop-shadow(0px 0px 4px rgba(255, 255, 255, 1)) brightness(1.3)'
        : 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
  }
}));

export default function Logo({ dark = false, height = 40 }: { dark?: boolean; height?: number | string }) {
  return <LogoImage src={logo} alt="SAYAD ERP" sx={{ height }} className={dark ? 'logo-dark-mode' : ''} />;
}
