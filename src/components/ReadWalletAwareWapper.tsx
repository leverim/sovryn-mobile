import React, { useMemo } from 'react';
import { useCurrentAccount } from 'hooks/useCurrentAccount';
import { isReadOnlyWallet } from 'utils/helpers';
import { Button, ButtonIntent } from './Buttons/Button';

export const ReadWalletAwareWrapper: React.FC = ({ children }) => {
  const account = useCurrentAccount();
  const isReadOnly = useMemo(() => isReadOnlyWallet(account), [account]);
  return (
    <>
      {!isReadOnly ? (
        children
      ) : (
        <>
          <Button
            title="Wallet is Read Only"
            intent={ButtonIntent.PRIMARY}
            disabled={true}
          />
        </>
      )}
    </>
  );
};
