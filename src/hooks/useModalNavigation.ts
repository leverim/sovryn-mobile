import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ModalStackRoutes } from 'routers/modal.routes';

export const useModalNavigation = () =>
  useNavigation<NavigationProp<ModalStackRoutes>>();
