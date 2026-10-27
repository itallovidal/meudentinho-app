import { Component } from "react";
import type { ReactNode } from "react";
import { ErrorScreen } from "./errorScreen";
import { ErrorState } from "./errorState";

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
        <ErrorScreen>
          <ErrorState
            title="Algo deu errado"
            message="Ocorreu um erro inesperado. Tente novamente."
            onRetry={() => this.setState({ hasError: false })}
          />
        </ErrorScreen>
      );
    }

    return this.props.children;
  }
}
