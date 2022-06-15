import { callToContract } from "utils/contract-utils";

export const getActiveLoans = (owner: string, chainId: number) => {
    return callToContract(chainId, 'sovrynProtocol');
};
