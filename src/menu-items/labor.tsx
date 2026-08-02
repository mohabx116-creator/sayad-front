import { IconBriefcase, IconClipboardList, IconUsersGroup } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { WORKERS_PERMISSIONS, WORKERS_VIEW_PERMISSIONS } from 'modules/Workers/utils/workers.constants';
import { OPERATIONAL_JOBS_PERMISSIONS, OPERATIONAL_JOBS_VIEW_PERMISSIONS } from 'modules/OperationalJobs/utils/operationalJobs.constants';
import { OPERATIONS_PERMISSIONS, OPERATIONS_VIEW_PERMISSIONS } from 'modules/Operations/utils/operations.constants';

const icons = {
  IconBriefcase,
  IconClipboardList,
  IconUsersGroup
};

const labor: NavItemType = {
  id: 'labor',
  title: 'labor',
  icon: icons.IconBriefcase,
  type: 'group',
  anyPermissions: [...WORKERS_VIEW_PERMISSIONS, ...OPERATIONAL_JOBS_VIEW_PERMISSIONS, ...OPERATIONS_VIEW_PERMISSIONS],
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
      id: 'operations',
      title: 'operations',
      type: 'item',
      url: '/labor/operations',
      icon: icons.IconClipboardList,
      breadcrumbs: true,
      permission: OPERATIONS_PERMISSIONS.view
    }
  ]
};

export default labor;
