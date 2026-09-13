import dashboard from './dashboard';
import administration from './administration';
import accounting from './accounting';
import parties from './parties';
import labor from './labor';
import treasury from './treasury';
import expenses from './expenses';
import settings from './settings';
import inventory from './inventory';
import purchases from './purchases';
import sales from './sales';
import manufacturing from './manufacturing';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, parties, labor, treasury, accounting, expenses, settings, sales, purchases, inventory, manufacturing, administration]
};

export default menuItems;
