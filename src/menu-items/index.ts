import dashboard from './dashboard';
import administration from './administration';
import parties from './parties';
import inventory from './inventory';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, parties, inventory, administration]
};

export default menuItems;
