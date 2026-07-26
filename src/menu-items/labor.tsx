import { IconBriefcase, IconCalendarEvent, IconClipboardList, IconCoins, IconUsersGroup } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { WORKERS_PERMISSIONS, WORKERS_VIEW_PERMISSIONS } from 'modules/Workers/utils/workers.constants';
import { OPERATIONAL_JOBS_PERMISSIONS, OPERATIONAL_JOBS_VIEW_PERMISSIONS } from 'modules/OperationalJobs/utils/operationalJobs.constants';
import { MONTHLY_MOVEMENTS_PERMISSIONS, MONTHLY_MOVEMENTS_VIEW_PERMISSIONS } from 'modules/LaborMonthlyMovements/utils/monthlyMovements.constants';
import { PAYROLL_PERMISSIONS, PAYROLL_VIEW_PERMISSIONS } from 'modules/Payroll/utils/payroll.constants';

const icons = {
  IconBriefcase,
  IconCalendarEvent,
  IconClipboardList,
  IconCoins,
  IconUsersGroup
};

const labor: NavItemType = {
  id: 'labor',
  title: 'labor',
  icon: icons.IconBriefcase,
  type: 'group',
  anyPermissions: [...WORKERS_VIEW_PERMISSIONS, ...OPERATIONAL_JOBS_VIEW_PERMISSIONS, ...MONTHLY_MOVEMENTS_VIEW_PERMISSIONS, ...PAYROLL_VIEW_PERMISSIONS],
  children: [
    {
      id: 'workers',
      title: 'workers',
      type: 'item',
      url: '/labor/workers',
      icon: icons.IconUsersGroup,
      breadcrumbs: true,
      permission: WORKERS_PERMISSIONS.view
    },
    {
      id: 'operational-jobs',
      title: 'operational-jobs',
      type: 'item',
      url: '/labor/operational-jobs',
      icon: icons.IconClipboardList,
      breadcrumbs: true,
      permission: OPERATIONAL_JOBS_PERMISSIONS.view
    },
    {
      id: 'monthly-movements',
      title: 'monthly-movements',
      type: 'item',
      url: '/labor/monthly-movements',
      icon: icons.IconCalendarEvent,
      breadcrumbs: true,
      permission: MONTHLY_MOVEMENTS_PERMISSIONS.view
    },
    {
      id: 'payroll-periods',
      title: 'payroll-periods',
      type: 'item',
      url: '/labor/payroll',
      icon: icons.IconCoins,
      breadcrumbs: true,
      permission: PAYROLL_PERMISSIONS.view
    }
  ]
};

export default labor;
