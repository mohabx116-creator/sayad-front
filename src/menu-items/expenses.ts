import { IconReceipt2, IconCategory } from '@tabler/icons-react';
import { NavItemType } from 'types';
import { EXPENSES_PERMISSIONS } from 'modules/Expenses/utils/expense.constants';

const icons = {
  IconReceipt2,
  IconCategory
};

const expenses: NavItemType = {
  id: 'expenses',
  title: 'expenses',
  type: 'group',
  children: [
    {
      id: 'expenses-dashboard',
      title: 'expenses.dashboard',
      type: 'item',
      url: '/expenses',
      icon: icons.IconReceipt2,
      breadcrumbs: false
    },
    {
      id: 'expenses-categories',
      title: 'expenses.categories',
      type: 'item',
      url: '/expenses/categories',
      icon: icons.IconCategory,
      breadcrumbs: false,
      permission: EXPENSES_PERMISSIONS.categoriesView
    },
    {
      id: 'expenses-list',
      title: 'expenses.list',
      type: 'item',
      url: '/expenses/list',
      icon: icons.IconReceipt2,
      breadcrumbs: false,
      permission: EXPENSES_PERMISSIONS.view
    }
  ]
};

export default expenses;
