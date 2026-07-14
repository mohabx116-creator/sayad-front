import dashboard from './dashboard';
import administration from './administration';
import parties from './parties';
import treasury from './treasury';
import inventory from './inventory';
import purchases from './purchases';
import sales from './sales';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, parties, treasury, sales, purchases, inventory, administration]
};

export default menuItems;
