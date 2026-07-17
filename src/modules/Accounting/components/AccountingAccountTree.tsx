import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { IconChevronDown, IconChevronRight, IconEdit, IconEye, IconPlus, IconPower, IconToggleLeft, IconToggleRight, IconTrash } from '@tabler/icons-react';
import { FormattedMessage } from 'react-intl';

import type { AccountingAccountTreeNodeDto } from '../types/accounting.types';

type AccountingAccountTreeProps = {
  nodes: AccountingAccountTreeNodeDto[];
  canCreateChild?: boolean;
  canEdit?: boolean;
  canToggleActive?: boolean;
  canDelete?: boolean;
  onCreateChild: (node: AccountingAccountTreeNodeDto) => void;
  onEdit: (node: AccountingAccountTreeNodeDto) => void;
  onToggleActive: (node: AccountingAccountTreeNodeDto) => void;
  onDelete: (node: AccountingAccountTreeNodeDto) => void;
};

function AccountingAccountTreeNode({
  node,
  level,
  canCreateChild = true,
  canEdit = true,
  canToggleActive = true,
  canDelete = true,
  onCreateChild,
  onEdit,
  onToggleActive,
  onDelete
}: {
  node: AccountingAccountTreeNodeDto;
  level: number;
  canCreateChild?: boolean;
  canEdit?: boolean;
  canToggleActive?: boolean;
  canDelete?: boolean;
  onCreateChild: (node: AccountingAccountTreeNodeDto) => void;
  onEdit: (node: AccountingAccountTreeNodeDto) => void;
  onToggleActive: (node: AccountingAccountTreeNodeDto) => void;
  onDelete: (node: AccountingAccountTreeNodeDto) => void;
}) {
  const [open, setOpen] = useState(level < 1);
  const hasChildren = node.children.length > 0;

  return (
    <Box sx={{ pl: level * 3, mb: 1.25 }}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: node.isActive ? 'divider' : 'warning.light',
          bgcolor: node.isActive ? 'background.paper' : 'warning.lighter',
          overflow: 'hidden'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
          <IconButton size="small" onClick={() => setOpen((value) => !value)} disabled={!hasChildren}>
            {hasChildren ? open ? <IconChevronDown size={18} /> : <IconChevronRight size={18} /> : <Box sx={{ width: 18 }} />}
          </IconButton>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                {node.code}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {node.nameArabic}
              </Typography>
              {node.nameEnglish && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {node.nameEnglish}
                </Typography>
              )}
              <Chip size="small" label={node.accountTypeLabel} variant="outlined" />
              <Chip size="small" color={node.isPosting ? 'info' : 'secondary'} label={<FormattedMessage id={node.isPosting ? 'posting-account' : 'header-account'} />} />
              <Chip size="small" color={node.isActive ? 'success' : 'default'} label={<FormattedMessage id={node.isActive ? 'active' : 'inactive'} />} />
              {node.isSystem && <Chip size="small" color="warning" label={<FormattedMessage id="system-account" defaultMessage="حساب نظامي" />} />}
            </Stack>
            {node.hierarchyPath && (
              <Typography variant="caption" color="text.secondary">
                {node.hierarchyPath}
              </Typography>
            )}
          </Box>
          <Tooltip title={<FormattedMessage id="details" />}>
            <IconButton component={RouterLink} to={`/accounting/chart-of-accounts/${node.id}`} size="small" color="primary">
              <IconEye size={18} />
            </IconButton>
          </Tooltip>
          {canCreateChild && (
            <Tooltip title={<FormattedMessage id="add-child-account" defaultMessage="إضافة حساب فرعي" />}>
              <IconButton onClick={() => onCreateChild(node)} size="small" color="primary">
                <IconPlus size={18} />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title={<FormattedMessage id="edit" />}>
              <IconButton onClick={() => onEdit(node)} size="small">
                <IconEdit size={18} />
              </IconButton>
            </Tooltip>
          )}
          {canToggleActive && (
            <Tooltip title={<FormattedMessage id={node.isActive ? 'deactivate' : 'activate'} />}>
              <IconButton onClick={() => onToggleActive(node)} size="small" color={node.isActive ? 'warning' : 'success'}>
                {node.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title={<FormattedMessage id="delete-permanent" defaultMessage="حذف نهائي" />}>
              <span>
                <IconButton onClick={() => onDelete(node)} size="small" color="error" disabled={node.isSystem}>
                  <IconTrash size={18} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
        {hasChildren && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {node.children.map((child) => (
                <AccountingAccountTreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  canCreateChild={canCreateChild}
                  canEdit={canEdit}
                  canToggleActive={canToggleActive}
                  canDelete={canDelete}
                  onCreateChild={onCreateChild}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Paper>
    </Box>
  );
}

export default function AccountingAccountTree({
  nodes,
  canCreateChild = true,
  canEdit = true,
  canToggleActive = true,
  canDelete = true,
  onCreateChild,
  onEdit,
  onToggleActive,
  onDelete
}: AccountingAccountTreeProps) {
  return (
    <Box>
      {nodes.map((node) => (
        <AccountingAccountTreeNode
          key={node.id}
          node={node}
          level={0}
          canCreateChild={canCreateChild}
          canEdit={canEdit}
          canToggleActive={canToggleActive}
          canDelete={canDelete}
          onCreateChild={onCreateChild}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}
