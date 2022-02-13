import React, { useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { PendingTransactions } from 'components/TransactionHistory/PendingTransactions';
import { AssetList } from './AssetList';

export const MainTabs: React.FC = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'assets', title: 'Assets' },
    { key: 'history', title: 'History' },
  ]);

  const renderScene = SceneMap({
    assets: () => <AssetList />,
    history: () => <PendingTransactions />,
  });

  const renderTabs = useCallback((props: any) => {
    const inputRange = props.navigationState.routes.map(
      (x: any, i: number) => i,
    );
    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex: number) =>
              inputIndex === i ? 1 : 0.5,
            ),
          });

          return (
            <TouchableOpacity
              key={i}
              style={styles.tabItem}
              onPress={() => setIndex(i)}>
              <Animated.Text style={[styles.text, { opacity }]}>
                {route.title}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, []);

  return (
    <TabView
      style={{ height: 25000 }}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabs}
      onIndexChange={setIndex}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  text: {
    color: 'white',
  },
});
