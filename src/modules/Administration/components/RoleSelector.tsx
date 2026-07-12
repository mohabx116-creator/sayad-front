import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { FormattedMessage } from 'react-intl';

import type { RoleDto } from '../types/administration.types';

type RoleSelectorProps = {
  roles: RoleDto[];
  value: string[];
  onChange: (roleIds: string[]) => void;
};

export default function RoleSelector({ roles, value, onChange }: RoleSelectorProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="role-selector-label">
        <FormattedMessage id="roles" />
      </InputLabel>
      <Select
        labelId="role-selector-label"
        multiple
        value={value}
        input={<OutlinedInput label={<FormattedMessage id="roles" />} />}
        renderValue={(selected) => roles.filter((role) => selected.includes(role.id)).map((role) => role.name).join(', ')}
        onChange={(event) => onChange(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value)}
      >
        {roles.map((role) => (
          <MenuItem key={role.id} value={role.id}>
            <Checkbox checked={value.includes(role.id)} />
            <ListItemText primary={role.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
