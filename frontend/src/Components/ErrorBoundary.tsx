import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    
    console.error('UI error captured by ErrorBoundary', { error, errorInfo });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-light px-4 text-center text-dark dark:bg-gray-900 dark:text-white">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h1 className="mb-3 text-2xl font-semibold">Algo salio mal</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ocurrio un error inesperado. Recarga la pagina para intentar de nuevo.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
