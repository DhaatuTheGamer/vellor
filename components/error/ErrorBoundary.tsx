import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-secondary dark:bg-primary-dark text-center p-8">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong reading your local data.</h1>
             <p className="text-gray-500 mb-6">Your data might be corrupted or the app encountered an unexpected error.</p>
             <button onClick={() => window.location.reload()} className="px-6 py-3 bg-accent text-primary-dark font-bold rounded-xl mr-4">Reload App</button>
             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-3 bg-danger text-white font-bold rounded-xl">Hard Reset (Wipe Data)</button>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}
