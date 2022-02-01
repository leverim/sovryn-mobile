import { transactionController } from 'controllers/TransactionController';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useWalletAddress } from 'hooks/useWalletAddress';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { ChainId } from 'types/network';
import { TokenId } from 'types/token';
import { encodeFunctionData } from 'utils/contract-utils';
import { currentChainId, parseUnits } from 'utils/helpers';
import { erc20 } from 'utils/interactions';
import { tokenUtils } from 'utils/token-utils';
import { Button } from './Buttons/Button';

type TokenApprovalFlowProps = {
  tokenId: TokenId;
  spender: string;
  requiredAmount: string;
  chainId?: ChainId;
  description?: string;
  loading?: boolean;
  disabled?: boolean;
};

export const TokenApprovalFlow: React.FC<TokenApprovalFlowProps> = ({
  children,
  tokenId,
  spender,
  requiredAmount,
  chainId = currentChainId(),
  description,
  loading: parentLoading,
  disabled,
}) => {
  const owner = useWalletAddress().toLowerCase();
  const token = useMemo(() => tokenUtils.getTokenById(tokenId), [tokenId]);
  const native = useMemo(() => tokenUtils.getNativeToken(chainId), [chainId]);
  const tokenAddress = useMemo(
    () => tokenUtils.getTokenAddressForChainId(token, chainId),
    [token, chainId],
  );

  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [allowance, setAllowance] = useState('0');

  const getAllowance = useCallback(
    (afterApprove?: boolean) => {
      if (token.id !== native.id) {
        afterApprove ? setApproving(true) : setLoading(true);
        erc20
          .getAllowance(chainId, tokenAddress, owner, spender)
          .then(response => {
            setAllowance(response.toString());
            afterApprove ? setApproving(false) : setLoading(false);
          })
          .catch(e => console.warn(e));
      } else {
        setAllowance('0');
        afterApprove ? setApproving(false) : setLoading(false);
      }
    },
    [chainId, native.id, owner, spender, token.id, tokenAddress],
  );

  useDebouncedEffect(
    () => {
      getAllowance();
    },
    300,
    [getAllowance],
  );

  const hasAllowance = useMemo(() => {
    if (token.id === native.id) {
      return true;
    }

    return parseUnits(requiredAmount, token.decimals).lte(allowance);
  }, [allowance, token, requiredAmount, native]);

  const handleApprove = useCallback(async () => {
    setApproving(true);
    try {
      const tx = await transactionController.request({
        to: tokenAddress,
        value: 0,
        data: encodeFunctionData('approve(address,uint256)', [
          spender,
          parseUnits(requiredAmount, token.decimals),
        ]),
        customData: {
          tokenId: token.id,
          approvalReason: description,
          approvalAmount: requiredAmount,
        },
      });
      await tx
        .wait()
        .then(() => getAllowance(true))
        .catch(e => {
          console.warn(e);
          getAllowance(true);
        });
    } catch (_) {
      //
    } finally {
      setApproving(false);
    }
  }, [
    tokenAddress,
    spender,
    requiredAmount,
    token.decimals,
    token.id,
    description,
    getAllowance,
  ]);

  return (
    <View>
      {hasAllowance ? (
        <>{children}</>
      ) : (
        <Button
          title={approving ? 'Approving...' : 'Approve'}
          onPress={handleApprove}
          primary
          loading={loading || parentLoading}
          disabled={loading || disabled || parentLoading || approving}
        />
      )}
    </View>
  );
};
