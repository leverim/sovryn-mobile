import { useHandleBackButton } from 'hooks/useHandleBackButton';

type HandleBackPressProps = {
  onClose: () => void;
};

export const HandleBackPress: React.FC<HandleBackPressProps> = ({
  onClose,
}) => {
  useHandleBackButton(onClose);
  return null;
};
