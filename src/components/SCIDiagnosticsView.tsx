import { runSCIDiagnostics } from "../diagnostics";

export default function SCIDiagnosticsView() {
  const results = runSCIDiagnostics();
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  return (
    <div className="space-y-6">
      <div className="bg-[#2f2f2f] text-white p-6 border border-[#3d3d3d]">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-400">
          SCI Foundation
        </p>
        <h1 className="text-3xl font-bold mt-2">Runtime Diagnostics</h1>
        <p className="text-sm text-gray-300 mt-2">
          Internal validation for the SCI shared domain, POS license adapter, and licensing engine.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500">Total Checks</p>
          <p className="text-3xl font-black text-gray-900">{results.length}</p>
        </div>

        <div className="bg-white border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500">Passed</p>
          <p className="text-3xl font-black text-green-700">{passed}</p>
        </div>

        <div className="bg-white border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500">Failed</p>
          <p className="text-3xl font-black text-red-700">{failed}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Diagnostic Results</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {results.map((result) => (
            <div key={result.name} className="p-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">{result.name}</p>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                <p className="text-xs font-mono text-gray-500 mt-2">{result.code}</p>
              </div>

              <span
                className={
                  result.passed
                    ? "px-3 py-1 text-xs font-bold bg-green-100 text-green-800"
                    : "px-3 py-1 text-xs font-bold bg-red-100 text-red-800"
                }
              >
                {result.passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
