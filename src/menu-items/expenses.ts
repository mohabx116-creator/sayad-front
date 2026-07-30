import { IconReceipt2, IconPlus } from '@tabler/icons-react';
import { NavItemType } from 'types';
import { EXPENSES_PERMISSIONS } from 'modules/Expenses/utils/expense.constants';

const icons = {
  IconReceipt2,
  IconPlus
};

const expenses: NavItemType = {
  id: 'expenses',
  title: 'expenses',
  type: 'group',
  children: [
    {
      id: 'expenses-list',
      title: 'expenses.list',
      type: 'item',
      url: '/expenses/list',
      icon: icons.IconReceipt2,
      breadcrumbs: false,
      permission: EXPENSES_PERMISSIONS.view
    },
    {
      id: 'expenses-create',
      title: 'expenses.create-expense',
      type: 'item',
      url: '/expenses/new',
      icon: icons.IconPlus,
      breadcrumbs: false,
      permission: EXPENSES_PERMISSIONS.create
    }
  ]
};

export default expenses;
