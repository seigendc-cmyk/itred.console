import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Terminal, ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught runtime error caught by Ecosystem Error Boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
    // Redirecting to root dashboard
    window.location.hash = '#/dashboard';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          id="global_error_boundary_container" 
          className="min-h-screen bg-[#F4F4F1] flex items-center justify-center p-6 font-sans"
        >
          <div 
            id="error_boundary_card" 
            className="w-full max-w-2xl bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative space-y-6"
          >
            {/* Top Warning Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

            {/* Error Header */}
            <div className="flex items-start space-x-4 border-b border-[#D1D1CF] pb-6">
              <div className="p-3 bg-red-50 border-2 border-red-500 text-red-600 rounded-none shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="bg-red-600 text-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase inline-block">
                  Runtime Exception Isolated
                </span>
                <h1 className="text-xl font-black text-[#1A1A1A] uppercase tracking-wide">
                  An Unexpected Error Occurred
                </h1>
                <p className="text-xs text-gray-500 font-mono">
                  THE ECOSYSTEM ROUTING CONTAINER HAS HALTED SAFELY
                </p>
              </div>
            </div>

            {/* Core User Message */}
            <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <p>
                The application encountered a critical instruction sequence error and has safely isolated the active workspace to prevent memory leaks or telemetry corruption.
              </p>
              <div className="bg-red-50/50 border border-red-200 p-4 font-mono text-xs text-red-800 space-y-1">
                <strong className="block text-red-950 uppercase text-[10px]">Error Signature:</strong>
                <p className="break-all">{this.state.error?.message || 'Unknown runtime error'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3 px-4 uppercase font-bold text-xs font-mono text-center tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex-1 bg-[#1A1A1A] hover:bg-black text-white py-3 px-4 uppercase font-bold text-xs font-mono text-center tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>

            {/* Collapsible Tech Breakdown */}
            <div className="border-t border-[#D1D1CF] pt-4">
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="text-xs font-mono font-bold text-gray-600 hover:text-[#FF5A00] flex items-center space-x-2 focus:outline-none transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>{this.state.showDetails ? 'HIDE TECHNICAL STACKTRACE' : 'SHOW TECHNICAL STACKTRACE'}</span>
              </button>

              {this.state.showDetails && (
                <div className="mt-3 bg-gray-950 border border-[#2A2A2A] p-4 font-mono text-[10px] text-[#8E9299] space-y-3 overflow-auto max-h-64 leading-normal">
                  <div>
                    <span className="text-[#FF5A00] font-bold">{"[STK_TRACE]"} Captured Call Stack:</span>
                    <pre className="whitespace-pre-wrap mt-1 overflow-x-auto text-red-400">
                      {this.state.error?.stack || 'No stack trace available'}
                    </pre>
                  </div>

                  {this.state.errorInfo && (
                    <div className="border-t border-[#2A2A2A] pt-2">
                      <span className="text-blue-400 font-bold">{"[CMP_STACK]"} Component Stack Info:</span>
                      <pre className="whitespace-pre-wrap mt-1 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="border-t border-[#2A2A2A] pt-2 text-[9px] text-gray-600 flex justify-between">
                    <span>HOST PROTOCOL: SEC_HALT_GATEWAY</span>
                    <span>SESSION CODE: ERR_BYPASS_ON</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Alert Warning */}
            <div className="bg-amber-50 border border-amber-300 p-3 text-[10px] text-amber-900 leading-normal font-mono flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>SYSOP ALERT:</strong> If this exception persists across hard reloads, please review client-side code state consistency in your system settings cache or clear browser local storage keys.
              </span>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
