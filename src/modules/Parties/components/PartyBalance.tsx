import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';

type PartyBalanceProps = {
  balance: number;
  balanceNature: string;
};

export default function PartyBalance({ balance, balanceNature }: PartyBalanceProps) {
  if (balanceNature === 'Debit') {
    return <Chip size="small" color="warning" label={<><FormattedMessage id="debit" />: {balance.toFixed(2)}</>} />;
  }

  if (balanceNature === 'Credit') {
    return <Chip size="small" color="info" label={<><FormattedMessage id="credit" />: {balance.toFixed(2)}</>} />;
  }

  return <Chip size="small" label={<FormattedMessage id="balanced" />} />;
}
