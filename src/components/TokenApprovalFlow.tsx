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
import { Button, ButtonIntent } from './Buttons/Button';

type TokenApprovalFlowProps = {
  tokenId: TokenId;
  spender: string;
  requiredAmount: string;
  chainId?: ChainId;
  description?: string;
};

export const TokenApprovalFlow: React.FC<TokenApprovalFlowProps> = ({
  children,
  tokenId,
  spender,
  requiredAmount,
  chainId = currentChainId(),
  description,
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

    return parseUnits(requiredAmount, token.decimals).lte(allowance);
  }, [allowance, token, requiredAmount, native]);

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await transactionController.request({
        to: tokenAddress,
        value: 0,
        // nonce: hexlify(Number(nonce || 0)),
        data: encodeFunctionData('approve(address,uint256)', [
          spender,
          parseUnits(requiredAmount, token.decimals),
        ]),
        // gasPrice: hexlify(Number(gasPrice || 0) * 1e9),
        // gasLimit: hexlify(Number(gas || 0) * 3),
        customData: {
          tokenId: token.id,
          approvalReason: description,
          approvalAmount: requiredAmount,
        },
      });
    } catch (_) {
      //
    } finally {
      setLoading(false);
    }
  }, [
    tokenAddress,
    spender,
    requiredAmount,
    token.decimals,
    token.id,
    description,
  ]);

  return (
    <View>
      {hasAllowance ? (
        <>{children}</>
      ) : (
        <>
          <Button
            title="Approve"
            onPress={handleApprove}
            intent={ButtonIntent.PRIMARY}
            loading={loading}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
};
