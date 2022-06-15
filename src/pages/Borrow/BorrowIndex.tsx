import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { PageContainer, SafeAreaPage } from 'templates/SafeAreaPage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  currentChainId,
  floorDecimals,
  formatAndCommify,
  formatUnits,
  isPositiveNumber,
} from 'utils/helpers';
import { lendingTokens } from 'config/lending-tokens';
import { useWalletAddress } from 'hooks/useWalletAddress';
import { useGlobalLoans } from 'hooks/app-context/useGlobalLoans';
import { RefreshControl } from 'components/RefreshControl';
import { BorrowRoutesStackProps } from 'routers/borrow.routes';
import { LendingTokenFlags } from 'models/lending-token';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { ReadWalletAwareWrapper } from 'components/ReadWalletAwareWapper';
import { BorrowAmountField } from './components/BorrowAmountField';
import { findAsset } from 'utils/asset-utils';
import { useCurrentChain } from 'hooks/useCurrentChain';
import { Text } from 'components/Text';
import { Asset } from 'models/asset';
import { useAssetBalance } from 'hooks/useAssetBalance';
import { useAssetUsdBalance } from 'hooks/useAssetUsdBalance';
import { Button } from 'components/Buttons/Button';
import { TokenApprovalFlow } from 'components/TokenApprovalFlow';
import { useBorrowPool } from './hooks/useBorrowPool';
import { contractCall, encodeFunctionData } from 'utils/contract-utils';
import { useIsMounted } from 'hooks/useIsMounted';
import Logger from 'utils/Logger';
import { AmountFieldBase } from 'components/AmountFieldBase';
import { SECONDS_IN_DAY } from 'utils/constants';
import { transactionController } from 'controllers/TransactionController';
import { getSwappableAsset } from 'config/swapables';
import { hexlify } from 'ethers/lib/utils';
import { constants } from 'ethers';

type Props = NativeStackScreenProps<BorrowRoutesStackProps, 'borrow.index'>;

enum FieldOfInterest {
  BORROW_AMOUNT,
  DEPOSIT_AMOUNT,
}

export const BorrowIndex: React.FC<Props> = () => {
  const { chainId } = useCurrentChain();
  const isMounted = useIsMounted();
  const owner = useWalletAddress()?.toLowerCase();
  const { execute: executeGlobalLoans } = useGlobalLoans(owner);
  const pools = useMemo(
    () =>
      lendingTokens.filter(
        item =>
          item.chainId === chainId &&
          !item.hasFlag(LendingTokenFlags.DEPRECATED),
      ),
    [chainId],
  );

  const borrowTokens = useMemo(
    () => pools.map(item => item.supplyToken),
    [pools],
  );

  const [borrowPool, setBorrowPool] = useState(pools[0]);

  const collateralTokens = useMemo(
    () =>
      pools
        .find(item => item.supplyTokenId === borrowPool.supplyToken.id)
        ?.collateralTokenIds.map(item => findAsset(chainId, item)) || [],
    [borrowPool.supplyToken.id, chainId, pools],
  );

  const [collateralToken, setCollateralToken] = useState(collateralTokens[0]);

  const [fieldOfInterest, setFieldOfInterest] = useState(
    FieldOfInterest.BORROW_AMOUNT,
  );
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralAmount, setCollaralAmount] = useState('');
  const [maxBorrowAmount, setMaxBorrowAmount] = useState('');
  const [initialLoanDuration, setInitialLoanDuration] = useState('28');

  const [_error, setError] = useState<Error>();

  const [submitting, setSubmitting] = useState(false);
  const [loadingMaxBorrowAmount, setLoadingMaxBorrowAmount] = useState(true);
  const [loadingBorrowAmountForDeposit, setLoadingBorrowAmountForDeposit] =
    useState(false);
  const [loadingDepositAmountForBorrow, setLoadingDepositAmountForBorrow] =
    useState(false);

  const getBorrowAmountForDeposit = useCallback(() => {
    if (
      !isPositiveNumber(collateralAmount) ||
      !isPositiveNumber(initialLoanDuration)
    ) {
      setLoadingBorrowAmountForDeposit(false);
      setBorrowAmount('');
      return;
    }

    setLoadingBorrowAmountForDeposit(true);
    contractCall(
      borrowPool.chainId,
      borrowPool.loanTokenAddress,
      'getBorrowAmountForDeposit(uint256,uint256,address)(uint256)',
      [
        collateralToken.parseUnits(collateralAmount),
        Number(initialLoanDuration) * SECONDS_IN_DAY,
        getSwappableAsset(collateralToken, collateralToken.chainId).address,
      ],
    )
      .then(result => {
        if (isMounted()) {
          setBorrowAmount(
            floorDecimals(borrowPool.supplyToken.formatUnits(result[0]), 8),
          );
        }
      })
      .catch(error => {
        Logger.error(error, 'getDepositAmountForBorrow');
        if (isMounted()) {
          setBorrowAmount('');
        }
      })
      .finally(() => {
        if (isMounted()) {
          setLoadingBorrowAmountForDeposit(false);
        }
      });
  }, [
    borrowPool.chainId,
    borrowPool.loanTokenAddress,
    borrowPool.supplyToken,
    collateralAmount,
    collateralToken,
    initialLoanDuration,
    isMounted,
  ]);

  const getDepositAmountForBorrow = useCallback(() => {
    if (
      !isPositiveNumber(borrowAmount) ||
      !isPositiveNumber(initialLoanDuration)
    ) {
      setLoadingDepositAmountForBorrow(false);
      setCollaralAmount('');
      return;
    }

    setLoadingDepositAmountForBorrow(true);
    contractCall(
      borrowPool.chainId,
      borrowPool.loanTokenAddress,
      'getDepositAmountForBorrow(uint256,uint256,address)(uint256)',
      [
        borrowPool.supplyToken.parseUnits(borrowAmount),
        Number(initialLoanDuration) * SECONDS_IN_DAY,
        getSwappableAsset(collateralToken, collateralToken.chainId).address,
      ],
    )
      .then(result => {
        if (isMounted()) {
          setCollaralAmount(
            floorDecimals(collateralToken.formatUnits(result[0]), 8),
          );
        }
      })
      .catch(error => {
        Logger.error(error, 'getDepositAmountForBorrow');
        if (isMounted()) {
          setCollaralAmount('');
        }
      })
      .finally(() => {
        if (isMounted()) {
          setLoadingDepositAmountForBorrow(false);
        }
      });
  }, [
    borrowAmount,
    borrowPool.chainId,
    borrowPool.loanTokenAddress,
    borrowPool.supplyToken,
    collateralToken,
    initialLoanDuration,
    isMounted,
  ]);

  const handleBorrowTokenChange = useCallback(
    (token: Asset) => {
      const pool = pools.find(item => item.supplyTokenId === token.id);
      if (pool) {
        setBorrowPool(pool);

        const tokens = pool.collateralTokenIds.map(item =>
          findAsset(pool.chainId, item),
        );
        if (tokens.findIndex(item => item.id === collateralToken.id) === -1) {
          setCollateralToken(tokens[0]);
        }
      }
    },
    [collateralToken.id, pools],
  );

  const { value: pool, loading: poolLoading } = useBorrowPool(borrowPool);

  const { value: collateralBalance, execute: executeCollateralBalance } =
    useAssetBalance(collateralToken, owner);

  const { value: borrowPrice } = useAssetUsdBalance(
    borrowPool.supplyToken,
    borrowPool.supplyToken.parseUnits(borrowAmount),
  );

  const { value: collateralPrice } = useAssetUsdBalance(
    collateralToken,
    collateralToken.parseUnits(collateralAmount),
  );

  const execute = useCallback(() => {
    executeGlobalLoans();
    executeCollateralBalance();
  }, [executeCollateralBalance, executeGlobalLoans]);

  const [_nextInterestRate, setNextInterestRate] = useState(
    pool.borrowInterestRate,
  );
  const [interestLoading, setInterestLoading] = useState(true);

  useEffect(() => {
    setInterestLoading(true);
    contractCall(
      chainId,
      borrowPool.loanTokenAddress,
      'nextBorrowInterestRate(uint256)(uint256)',
      [borrowPool.supplyToken.parseUnits(borrowAmount)],
    )
      .then(response => response.toString())
      .then(response => {
        if (isMounted()) {
          setNextInterestRate(response);
          setInterestLoading(false);
        }
      })
      .catch(error => {
        Logger.error(error, 'nextBorrowInterestRate');
        if (isMounted()) {
          setNextInterestRate(undefined!);
          setInterestLoading(false);
        }
      });
  }, [
    chainId,
    isMounted,
    borrowPool.loanTokenAddress,
    borrowPool.supplyToken,
    borrowAmount,
  ]);

  const nextInterestRate = useMemo(
    () =>
      _nextInterestRate !== undefined
        ? _nextInterestRate
        : pool.borrowInterestRate,
    [_nextInterestRate, pool.borrowInterestRate],
  );

  useEffect(() => {
    if (
      !isPositiveNumber(collateralBalance) ||
      !isPositiveNumber(initialLoanDuration)
    ) {
      setLoadingMaxBorrowAmount(false);
      setMaxBorrowAmount('0');
      return;
    }

    setLoadingMaxBorrowAmount(true);
    contractCall(
      borrowPool.chainId,
      borrowPool.loanTokenAddress,
      'getBorrowAmountForDeposit(uint256,uint256,address)(uint256)',
      [
        collateralToken.parseUnits(collateralBalance),
        Number(initialLoanDuration) * SECONDS_IN_DAY,
        getSwappableAsset(collateralToken, collateralToken.chainId).address,
      ],
    )
      .then(result => {
        if (isMounted()) {
          setMaxBorrowAmount(borrowPool.supplyToken.formatUnits(result[0]));
        }
      })
      .catch(error => {
        Logger.error(error, 'getBorrowAmountForDeposit 2');
      })
      .finally(() => {
        if (isMounted()) {
          setLoadingMaxBorrowAmount(false);
        }
      });
  }, [
    borrowPool.chainId,
    borrowPool.loanTokenAddress,
    borrowPool.supplyToken,
    collateralBalance,
    collateralToken,
    initialLoanDuration,
    isMounted,
  ]);

  const handleBorrowAmountChange = useCallback(value => {
    setFieldOfInterest(FieldOfInterest.BORROW_AMOUNT);
    setBorrowAmount(value);
  }, []);

  const handleCollateralAmountChange = useCallback(value => {
    setFieldOfInterest(FieldOfInterest.DEPOSIT_AMOUNT);
    setCollaralAmount(value);
  }, []);

  useEffect(() => {
    if (fieldOfInterest === FieldOfInterest.DEPOSIT_AMOUNT) {
      getBorrowAmountForDeposit();
    } else {
      getDepositAmountForBorrow();
    }
  }, [
    fieldOfInterest,
    getBorrowAmountForDeposit,
    getDepositAmountForBorrow,
    borrowAmount,
    collateralAmount,
    borrowPool,
    collateralToken,
  ]);

  const error = useMemo(() => {
    if (_error) {
      return _error.message;
    }
  }, [_error]);

  const loading = useMemo(
    () =>
      interestLoading ||
      loadingMaxBorrowAmount ||
      loadingBorrowAmountForDeposit ||
      loadingDepositAmountForBorrow ||
      submitting ||
      poolLoading,
    [
      interestLoading,
      loadingBorrowAmountForDeposit,
      loadingDepositAmountForBorrow,
      loadingMaxBorrowAmount,
      poolLoading,
      submitting,
    ],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    console.log('hexlify', hexlify(0), [
      '0',
      borrowPool.supplyToken.parseUnits(borrowAmount),
      Number(initialLoanDuration) * SECONDS_IN_DAY,
      collateralToken.parseUnits(collateralAmount),
      getSwappableAsset(collateralToken, collateralToken.chainId).address,
      owner,
      owner,
      '0x',
    ]);
    transactionController
      .request({
        to: borrowPool.loanTokenAddress,
        value: hexlify(
          collateralToken.native
            ? collateralToken.parseUnits(collateralAmount)
            : 0,
        ),
        data: encodeFunctionData(
          'borrow(bytes32,uint256,uint256,uint256,address,address,address,bytes)(uint256,uint256)',
          [
            constants.HashZero,
            borrowPool.supplyToken.parseUnits(borrowAmount),
            Number(initialLoanDuration) * SECONDS_IN_DAY,
            collateralToken.parseUnits(collateralAmount),
            getSwappableAsset(collateralToken, collateralToken.chainId).address,
            owner,
            owner,
            '0x',
          ],
        ),
      })
      .catch(err => {
        console.warn('my error: ', err.message);
      })
      .finally(() => {
        if (isMounted()) {
          setSubmitting(false);
        }
      });

    setSubmitting(false);

    // console.log(tx);
  }, [
    borrowAmount,
    borrowPool.loanTokenAddress,
    borrowPool.supplyToken,
    collateralAmount,
    collateralToken,
    initialLoanDuration,
    isMounted,
    owner,
  ]);

  const repayDate = useMemo(
    () =>
      dayjs()
        .add(Number(initialLoanDuration || 1), 'days')
        .toString(),
    [initialLoanDuration],
  );

  return (
    <SafeAreaPage
      scrollView
      scrollViewProps={{
        refreshControl: (
          <RefreshControl refreshing={false} onRefresh={execute} />
        ),
      }}>
      <PageContainer>
        <BorrowAmountField
          title={<Text>Borrow</Text>}
          token={borrowPool.supplyToken}
          amount={borrowAmount}
          onAmountChanged={handleBorrowAmountChange}
          balance={maxBorrowAmount}
          price={borrowPrice!}
          debounceDelay={500}
          tokens={borrowTokens}
          onTokenChanged={handleBorrowTokenChange}
          pickerKey="_borrow"
          pickerTitle="Asset to Borrow"
          balanceTitle="Max"
        />

        <BorrowAmountField
          title={<Text>Collateral</Text>}
          token={collateralToken}
          amount={collateralAmount}
          onAmountChanged={handleCollateralAmountChange}
          balance={collateralBalance}
          price={collateralPrice!}
          debounceDelay={500}
          tokens={collateralTokens}
          onTokenChanged={setCollateralToken}
          pickerKey="_collateral"
          pickerTitle="Collateral Asset"
        />

        <AmountFieldBase
          title={<Text>Initial loan duration:</Text>}
          amount={initialLoanDuration}
          onAmountChanged={setInitialLoanDuration}
          debounceDelay={500}
          inputProps={{ placeholder: '28 days' }}
          rightElement={<Text>Days</Text>}
          bottomElement={<Text>Repay until {repayDate}</Text>}
        />

        <ReadWalletAwareWrapper>
          {error ? (
            <Button title={error} primary disabled />
          ) : (
            <TokenApprovalFlow
              tokenId={collateralToken.id}
              spender={borrowPool.loanTokenAddress}
              loading={loading}
              disabled={loading}
              requiredAmount={collateralAmount}>
              <Button
                title={error ? error : 'Borrow'}
                onPress={handleSubmit}
                primary
                loading={loading}
                disabled={loading || !!error}
              />
            </TokenApprovalFlow>
          )}
        </ReadWalletAwareWrapper>

        <Text>
          Interest Rate: {formatAndCommify(nextInterestRate, 18, 4)} %
        </Text>

        <PendingTransactions />
      </PageContainer>
    </SafeAreaPage>
  );
};
