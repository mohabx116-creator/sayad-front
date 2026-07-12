import dashboard from './dashboard';
import administration from './administration';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, administration]
};

export default menuItems;
