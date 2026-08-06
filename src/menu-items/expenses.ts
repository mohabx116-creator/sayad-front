import { IconReceipt2 } from '@tabler/icons-react';
import { NavItemType } from 'types';
import { EXPENSES_PERMISSIONS } from 'modules/Expenses/utils/expense.constants';

const icons = {
  IconReceipt2
};

const expenses: NavItemType = {
  id: 'expenses',
  title: 'expenses',
  type: 'group',
  url: '/expenses/list',
  icon: icons.IconReceipt2,
  breadcrumbs: false,
  permission: EXPENSES_PERMISSIONS.view
};

export default expenses;
