import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useWalletAddress } from 'hooks/useWalletAddress';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { currentChainId } from 'utils/helpers';
import { erc20 } from 'utils/interactions';
import { tokenUtils } from 'utils/token-utils';
import { PressableButton } from './PressableButton';
import { Text } from './Text';
import { TokenApprovalModal } from './TokenApprovalModal';

type TokenApprovalFlowProps = {
  tokenId: TokenId;
  spender: string;
  requiredAmount: string;
  chainId?: ChainId;
  description?: string;
  gasPrice?: string;
};

export const TokenApprovalFlow: React.FC<TokenApprovalFlowProps> = ({
  children,
  tokenId,
  spender,
  requiredAmount,
  chainId = currentChainId(),
  description,
  gasPrice,
}) => {
  const owner = useWalletAddress();
  const token = useMemo(() => tokenUtils.getTokenById(tokenId), [tokenId]);
  const native = useMemo(() => tokenUtils.getNativeToken(chainId), [chainId]);
  const tokenAddress = useMemo(
    () => tokenUtils.getTokenAddressForChainId(token, chainId),
    [token, chainId],
  );

  const [loading, setLoading] = useState(true);
  const [allowance, setAllowance] = useState('0');

  useDebouncedEffect(
    () => {
      if (token.id !== native.id) {
        setLoading(true);
        erc20
          .getAllowance(chainId, tokenAddress, owner, spender)
          .then(response => {
            setAllowance(response.toString());
            setLoading(false);
          })
          .catch(e => console.warn(e));
      } else {
        setLoading(false);
        setAllowance('0');
      }
    },
    300,
    [chainId, tokenAddress, owner, spender, native],
  );

  const hasAllowance = useMemo(() => {
    if (token.id === native.id) {
      return true;
    }

    return parseUnits(requiredAmount || '0', token.decimals).lte(allowance);
  }, [allowance, token, requiredAmount, native]);

  const [showModal, setShowModal] = useState(false);

  return (
    <View>
      {hasAllowance ? (
        <>{children}</>
      ) : (
        <>
          <PressableButton title="Approve" onPress={() => setShowModal(true)} />
          <TokenApprovalModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onCompleted={setAllowance}
            chainId={chainId}
            amount={requiredAmount}
            token={token}
            tokenAddress={tokenAddress}
            spender={spender}
            owner={owner}
            description={description}
            gasPrice={gasPrice}
          />
        </>
      )}
      <Text>Allowance: {formatUnits(allowance, token.decimals)}</Text>
      <Text>Required: {requiredAmount}</Text>
      <Text>Loading: {loading ? 'yes' : 'no'}</Text>
    </View>
  );
};
