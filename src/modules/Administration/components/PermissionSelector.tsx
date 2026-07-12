import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

import type { PermissionDto } from '../types/administration.types';

type PermissionSelectorProps = {
  permissions: PermissionDto[];
  value: string[];
  onChange: (permissionIds: string[]) => void;
};

export default function PermissionSelector({ permissions, value, onChange }: PermissionSelectorProps) {
  const intl = useIntl();
  const isArabic = intl.locale.startsWith('ar');
  const modules = Array.from(new Set(permissions.map((permission) => permission.module))).sort();

  const toggle = (permissionId: string) => {
    onChange(value.includes(permissionId) ? value.filter((id) => id !== permissionId) : [...value, permissionId]);
  };

  return (
    <Stack spacing={2}>
      {modules.map((module) => {
        const modulePermissions = permissions.filter((permission) => permission.module === module);
        return (
          <Stack key={module} spacing={0.5}>
            <Typography variant="h5">{module}</Typography>
            {modulePermissions.map((permission) => (
              <FormControlLabel
                key={permission.id}
                control={<Checkbox checked={value.includes(permission.id)} onChange={() => toggle(permission.id)} />}
                label={isArabic ? permission.nameArabic : permission.nameEnglish}
              />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}
