import { useMemo } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage, useIntl } from 'react-intl';

import type { PermissionDto } from '../types/administration.types';

type PermissionMatrixProps = {
  permissions: PermissionDto[];
  value: string[];
  onChange: (permissionIds: string[]) => void;
};

const ACTION_COLUMNS = [
  { key: 'view', labelId: 'view', matches: ['view', 'read', 'list', 'get'] },
  { key: 'add', labelId: 'add', matches: ['add', 'create', 'insert', 'new'] },
  { key: 'edit', labelId: 'edit', matches: ['edit', 'update', 'modify'] },
  { key: 'delete', labelId: 'delete', matches: ['delete', 'remove', 'destroy'] },
  { key: 'approve', labelId: 'approve', matches: ['approve', 'authorize', 'accept'] },
  { key: 'other', labelId: 'more-items', matches: [] } // Fallback
];

export default function PermissionMatrix({ permissions, value, onChange }: PermissionMatrixProps) {
  const intl = useIntl();
  const isArabic = intl.locale.startsWith('ar');

  const { modules, matrixData } = useMemo(() => {
    const mods = Array.from(new Set(permissions.map((p) => p.module))).sort();
    
    const data: Record<string, Record<string, PermissionDto[]>> = {};
    
    mods.forEach(mod => {
      data[mod] = {};
      ACTION_COLUMNS.forEach(col => data[mod][col.key] = []);
      
      const modPerms = permissions.filter(p => p.module === mod);
      
      modPerms.forEach(p => {
        let matched = false;
        const nameLower = p.nameEnglish.toLowerCase();
        
        for (const col of ACTION_COLUMNS) {
          if (col.key !== 'other' && col.matches.some(m => nameLower.includes(m))) {
            data[mod][col.key].push(p);
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          data[mod]['other'].push(p);
        }
      });
    });
    
    return { modules: mods, matrixData: data };
  }, [permissions]);

  const toggleModuleAction = (module: string, actionKey: string) => {
    const perms = matrixData[module][actionKey];
    if (perms.length === 0) return;
    
    const allSelected = perms.every(p => value.includes(p.id));
    if (allSelected) {
      // Remove all
      const idsToRemove = perms.map(p => p.id);
      onChange(value.filter(id => !idsToRemove.includes(id)));
    } else {
      // Add all
      const idsToAdd = perms.map(p => p.id).filter(id => !value.includes(id));
      onChange([...value, ...idsToAdd]);
    }
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}><FormattedMessage id="system-module" /></TableCell>
            {ACTION_COLUMNS.map(col => (
              <TableCell key={col.key} align="center" sx={{ fontWeight: 'bold' }}>
                <FormattedMessage id={col.labelId} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {modules.map((mod) => (
            <TableRow key={mod} hover>
              <TableCell sx={{ fontWeight: 600 }}>{mod}</TableCell>
              {ACTION_COLUMNS.map(col => {
                const perms = matrixData[mod][col.key];
                if (perms.length === 0) {
                  return (
                    <TableCell key={col.key} align="center">
                      <Checkbox disabled />
                    </TableCell>
                  );
                }
                
                const allSelected = perms.every(p => value.includes(p.id));
                const someSelected = perms.some(p => value.includes(p.id));
                
                // If there is only one permission for this cell, just show a simple checkbox.
                // If there are multiple (e.g. multiple 'other' permissions), show an indeterminate checkbox with a tooltip.
                return (
                  <TableCell key={col.key} align="center">
                    <Tooltip 
                      title={
                        perms.length > 1 
                        ? perms.map(p => isArabic ? p.nameArabic : p.nameEnglish).join(', ') 
                        : isArabic ? perms[0].nameArabic : perms[0].nameEnglish
                      }
                    >
                      <Checkbox 
                        checked={allSelected} 
                        indeterminate={someSelected && !allSelected}
                        onChange={() => toggleModuleAction(mod, col.key)}
                        color="primary"
                      />
                    </Tooltip>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
