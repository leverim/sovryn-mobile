import { transactionController } from 'controllers/TransactionController';
import { useDebouncedEffect } from 'hooks/useDebounceEffect';
import { useWalletAddress } from 'hooks/useWalletAddress';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { ChainId } from 'types/network';
import { TokenId } from 'types/asset';
import { findAsset, getNativeAsset } from 'utils/asset-utils';
import { encodeFunctionData } from 'utils/contract-utils';
import { currentChainId, parseUnits } from 'utils/helpers';
import { erc20 } from 'utils/interactions';
import { Button } from './Buttons/Button';
import { useIsMounted } from 'hooks/useIsMounted';

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
  const isMounted = useIsMounted();
  const owner = useWalletAddress().toLowerCase();
  const token = useMemo(() => findAsset(chainId, tokenId), [chainId, tokenId]);
  const native = useMemo(() => getNativeAsset(chainId), [chainId]);

  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [allowance, setAllowance] = useState('0');

  const getAllowance = useCallback(
    (afterApprove?: boolean) => {
      if (token.id !== native.id) {
        afterApprove ? setApproving(true) : setLoading(true);
        erc20
          .getAllowance(chainId, token.address, owner, spender)
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
    [chainId, native.id, owner, spender, token.address, token.id],
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
        to: token.address,
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
        .then(() => {
          if (isMounted()) {
            getAllowance(true);
          }
        })
        .catch(() => {
          if (isMounted()) {
            getAllowance(true);
          }
        });
    } catch (_) {
      //
    } finally {
      if (isMounted()) {
        setApproving(false);
      }
    }
  }, [
    token.address,
    token.decimals,
    token.id,
    spender,
    requiredAmount,
    description,
    isMounted,
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
