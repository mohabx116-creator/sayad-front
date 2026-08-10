import { IconBriefcase, IconCoins, IconClipboardList, IconUsersGroup } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { WORKERS_PERMISSIONS, WORKERS_VIEW_PERMISSIONS } from 'modules/Workers/utils/workers.constants';
import { OPERATIONAL_JOBS_PERMISSIONS, OPERATIONAL_JOBS_VIEW_PERMISSIONS } from 'modules/OperationalJobs/utils/operationalJobs.constants';
import { OPERATIONS_PERMISSIONS, OPERATIONS_VIEW_PERMISSIONS } from 'modules/Operations/utils/operations.constants';
import { PAYROLL_PERMISSIONS, PAYROLL_VIEW_PERMISSIONS } from 'modules/Payroll/utils/payroll.constants';

const icons = {
  IconBriefcase,
  IconClipboardList,
  IconUsersGroup,
  IconCoins
};

const labor: NavItemType = {
  id: 'labor',
  title: 'labor',
  icon: icons.IconBriefcase,
  type: 'group',
  anyPermissions: [
    ...WORKERS_VIEW_PERMISSIONS,
    ...OPERATIONAL_JOBS_VIEW_PERMISSIONS,
    ...OPERATIONS_VIEW_PERMISSIONS,
    ...PAYROLL_VIEW_PERMISSIONS
  ],
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
      id: 'payroll',
      title: 'payroll',
      type: 'item',
      url: '/payroll/periods',
      icon: icons.IconCoins,
      breadcrumbs: true,
      permission: PAYROLL_PERMISSIONS.view
    }
  ]
};

export default labor;
