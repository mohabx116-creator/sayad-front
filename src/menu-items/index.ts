import dashboard from './dashboard';
import administration from './administration';
import parties from './parties';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, parties, administration]
};

export default menuItems;
