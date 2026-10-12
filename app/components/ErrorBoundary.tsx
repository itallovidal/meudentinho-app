import { Component } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-base-100 px-6">
          <Text variant="h3" className="mb-2 text-center">
            Algo deu errado
          </Text>
          <Text className="mb-6 text-center text-muted">
            Ocorreu um erro inesperado. Tente novamente.
          </Text>
          <Button onPress={() => this.setState({ hasError: false })}>
            <Text>Tentar novamente</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
