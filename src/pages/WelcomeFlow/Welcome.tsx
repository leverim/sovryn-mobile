import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { DarkTheme } from '@react-navigation/native';
import { px } from 'utils/helpers';
import { SplashScreen } from 'pages/SplashScreen';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding'>;

export const Welcome: React.FC<Props> = ({ navigation }) => {
  return (
    <SplashScreen>
      <SafeAreaPage>
        <View style={[globalStyles.page, styles.container]}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={globalStyles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            You can create a new wallet or connect any existing one
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Create"
              onPress={() => navigation.navigate('onboarding.create')}
            />
            <Button
              title="Import"
              onPress={() => navigation.navigate('onboarding.import')}
            />
          </View>
        </View>
      </SafeAreaPage>
    </SplashScreen>
  );
};

const Button: React.FC<{ title: string; onPress: () => void }> = ({
  title,
  onPress,
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      style={[styles.button, pressed && styles.buttonPressed]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  subtitle: {
    marginBottom: px(36),
    fontSize: px(18),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: DarkTheme.colors.primary,
    paddingHorizontal: px(48),
    paddingVertical: px(18),
    borderRadius: px(12),
  },
  buttonPressed: {
    transform: [{ scale: 1.05 }],
  },
  buttonText: {
    fontWeight: '500',
    fontSize: px(18),
    textAlign: 'center',
  },
  logo: {
    width: 128,
    height: 128,
    marginBottom: 24,
  },
});
