import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[canvasMD] UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="fatal-screen">
        <section className="fatal-card glass-panel">
          <h1>canvasMD поймал ошибку интерфейса</h1>
          <p>Это не черный экран: приложение загрузилось, но один из компонентов упал. Ниже текст ошибки.</p>
          <pre>{this.state.error.stack ?? this.state.error.message}</pre>
          <button onClick={() => localStorage.clear()}>Очистить локальные данные</button>
          <button onClick={() => window.location.reload()}>Перезапустить</button>
        </section>
      </main>
    );
  }
}
