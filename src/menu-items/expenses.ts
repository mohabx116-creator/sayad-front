import { IconReceipt2, IconPlus } from '@tabler/icons-react';
import { NavItemType } from 'types';
import { EXPENSES_PERMISSIONS } from 'modules/Expenses/utils/expense.constants';

const icons = {
  IconReceipt2,
  IconPlus
};

const expenses: NavItemType = {
  id: 'expenses-group',
  title: 'expenses',
  type: 'group',
  children: [
    {
      id: 'expenses',
      title: 'expenses',
      type: 'item',
      url: '/expenses/list',
      icon: icons.IconReceipt2,
      breadcrumbs: false,
      permission: EXPENSES_PERMISSIONS.view
    }
  ]
};

export default expenses;
