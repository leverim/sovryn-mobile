import Toast, { ToastShowParams } from 'react-native-toast-message';

class ToastController {
  public show(params: ToastShowParams) {
    Toast.show(params);
  }
  public hide(params?: void | undefined) {
    Toast.hide(params);
  }
}

export const toast = new ToastController();
