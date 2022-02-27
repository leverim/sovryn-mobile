import React from 'react';
import { RefreshControl as RC, RefreshControlProps } from 'react-native';

const REFRESH_CONTROL_COLOR = '#ffffff';

export const RefreshControl: React.FC<RefreshControlProps> = ({ ...props }) => {
  return (
    <RC
      tintColor={REFRESH_CONTROL_COLOR}
      colors={[REFRESH_CONTROL_COLOR]}
      titleColor={REFRESH_CONTROL_COLOR}
      progressBackgroundColor="rgba(255, 255, 255, 0.3)"
      {...props}
    />
  );
};
