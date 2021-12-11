import type { ParamType } from '@ethersproject/abi/src.ts/fragments';
import type { BytesLike } from '@ethersproject/bytes';
import type { TransactionRequest } from '@ethersproject/abstract-provider';
import type { Deferrable } from '@ethersproject/properties';
import {
  isHexString,
  id as keccak256,
  defaultAbiCoder,
  hexConcat,
} from 'ethers/lib/utils';
import { getProvider } from 'utils/RpcEngine';

const INSIDE_EVERY_PARENTHESES = /\((?:[^()]|\([^()]*\))*\)/g;

export const functionSignature = (method: string) =>
  keccak256(method).substr(0, 10);

export const encodeParameters = (
  types: ReadonlyArray<string | ParamType>,
  values: ReadonlyArray<any>,
) => defaultAbiCoder.encode(types, values);
export const decodeParameters = (
  types: ReadonlyArray<string | ParamType>,
  data: BytesLike,
) => defaultAbiCoder.decode(types, data, true);

export const encodeParameter = (type: string, value: any) =>
  encodeParameters([type], [value]);
export const decodeParameter = (type: string, data: string) =>
  decodeParameters([type], data);

const getParameters = (types: string[]) => {
  const hasTuple = types.indexOf('[]');
  if (hasTuple !== -1) {
    types[hasTuple - 1] = types[hasTuple - 1] + '[]';
    delete types[hasTuple];
  }
  return types.filter(e => !!e);
};

export const prepareFunction = (method: string) => {
  const [input, output] = (method.match(INSIDE_EVERY_PARENTHESES) || []).map(
    item => item.slice(1, -1),
  );
  const inputTypes = getParameters(input.match(/(\(.*?\)|[^),\s]+)/g) || []);
  const outputTypes = output
    ? getParameters(output.match(/(\(.*?\)|[^),\s]+)/g) || [])
    : [];
  return {
    method: method.split('(')[0] + '(' + input + ')',
    types: inputTypes,
    // args,
    returnTypes: outputTypes,
  };
};

export const encodeFunctionData = (
  method: string,
  values: ReadonlyArray<any>,
) => {
  const { method: fn, types } = prepareFunction(method);
  return hexConcat([functionSignature(fn), encodeParameters(types, values)]);
};

export const encodeFunctionDataWithTypes = (
  method: string,
  types: ReadonlyArray<string | ParamType>,
  values: ReadonlyArray<any>,
) => hexConcat([functionSignature(method), encodeParameters(types, values)]);

export const prefixHex = (value: string) =>
  isHexString(value) ? value : `0x${value}`;

export async function contractCall<T = Record<string | number, any>>(
  chainId: number,
  to: string,
  methodAndTypes: string,
  args: ReadonlyArray<any>,
  request?: Deferrable<TransactionRequest>,
): Promise<T> {
  const { method, types, returnTypes } = prepareFunction(methodAndTypes);
  return getProvider(chainId)
    .call({
      to,
      data: hexConcat([
        functionSignature(method),
        encodeParameters(types, args),
      ]),
      ...request,
    })
    .then(response => decodeParameters(returnTypes, response) as unknown as T);
}

export async function contractSend(
  chainId: number,
  to: string,
  methodAndTypes: string,
  args: ReadonlyArray<any>,
  request?: TransactionRequest,
): Promise<string> {
  const data = encodeFunctionData(methodAndTypes, args);
  // todo
  return Promise.resolve(data);

  // getProvider(chainId).getSigner().signTransaction()
  //
  // return getProvider(chainId).sendTransaction({
  //   to: to,
  //   data,
  //   ...request,
  // });
}
