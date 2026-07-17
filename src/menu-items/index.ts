import dashboard from './dashboard';
import administration from './administration';
import parties from './parties';
import treasury from './treasury';
import expenses from './expenses';
import inventory from './inventory';
import purchases from './purchases';
import sales from './sales';
import system from './system';
import { NavItemType } from 'types';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, parties, treasury, expenses, sales, purchases, inventory, administration, system]
};

export default menuItems;
