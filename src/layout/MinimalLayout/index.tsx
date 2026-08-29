import { Outlet } from 'react-router-dom';

// project imports
import Customization from '../Customization';
import { useRouteBrowserTitle } from 'shared/hooks/useBrowserTitle';

// ==============================|| MINIMAL LAYOUT ||============================== //

export default function MinimalLayout() {
  useRouteBrowserTitle();
  return (
    <>
      <Outlet />
      <Customization />
    </>
  );
}
