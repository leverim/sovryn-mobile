import React, { useMemo, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  View,
  ViewStyle,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import Toast from 'react-native-toast-notifications';
import { globalStyles } from 'global.styles';

type SafeAreaPageProps = {
  keyboardAvoiding?: boolean;
  scrollView?: boolean;
  padded?: boolean;
  scrollViewProps?: ScrollViewProps;
};

export const SafeAreaPage: React.FC<SafeAreaPageProps> = ({
  children,
  keyboardAvoiding = false,
  scrollView = false,
  scrollViewProps,
}) => {
  const offset = useHeaderHeight();
  const toastRef = useRef<any>();

  const renderScrollView = useMemo(() => {
    if (scrollView) {
      return <ScrollView {...scrollViewProps}>{children}</ScrollView>;
    }
    return children;
  }, [children, scrollView, scrollViewProps]);

  const renderChildren = useMemo(
    () => (
      <SafeAreaView style={styles.container}>
        {renderScrollView}
        <Toast ref={toastRef!} />
      </SafeAreaView>
    ),
    [renderScrollView],
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={offset}
        style={styles.keyboardAvoidingView}>
        {renderChildren}
      </KeyboardAvoidingView>
    );
  }
  return renderChildren;
};

type PageContainer = {
  paddingVertical?: number;
  paddingHorizontal?: number;
  style?: ViewStyle;
};

export const PageContainer: React.FC<PageContainer> = ({
  children,
  style,
  paddingVertical = globalStyles.page.paddingVertical,
  paddingHorizontal = globalStyles.page.paddingHorizontal,
}) => {
  return (
    <View style={[{ paddingHorizontal, paddingVertical }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});
