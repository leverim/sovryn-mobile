import { captureException } from '@sentry/react-native';
import React, { Component, ReactNode } from 'react';
import { Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    console.error(error);
    captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Sorry.. there was an error</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
