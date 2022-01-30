import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WelcomeFlowStackProps } from '.';
import { SafeAreaPage } from 'templates/SafeAreaPage';
import { globalStyles } from 'global.styles';
import { Text } from 'components/Text';
import { DarkTheme } from '@react-navigation/native';

type Props = NativeStackScreenProps<WelcomeFlowStackProps, 'onboarding'>;

export const Welcome: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaPage>
      <View style={[globalStyles.page, styles.container]}>
        <Text style={globalStyles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          You can create a new wallet or connect any existing one
        </Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('onboarding.create')}>
            <Text style={styles.buttonText}>Create</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('onboarding.import')}>
            <Text style={styles.buttonText}>Import</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaPage>
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
    marginBottom: 36,
    fontSize: 18,
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
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 18,
    textAlign: 'center',
  },
});
