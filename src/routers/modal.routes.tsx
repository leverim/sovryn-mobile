import { Asset } from 'models/asset';

export type ModalStackRoutes = {
  'modal.send-asset': { asset: Asset };
  'modal.receive-asset': { asset: Asset };
  'modal.transactions': undefined;
  'modal.asset-picker': {
    parentRoute: string;
    pickerKey: string;
    title?: string;
    value?: Asset;
    items: Asset[];
  };
};
