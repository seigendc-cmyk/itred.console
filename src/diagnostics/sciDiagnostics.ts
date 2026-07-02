import { runSCIPOSLicenseHarness } from "../tests";

export interface SCIDiagnosticResult {
  name: string;
  passed: boolean;
  code?: string;
  message: string;
}

export function runSCIDiagnostics(): SCIDiagnosticResult[] {
  const harness = runSCIPOSLicenseHarness();

  return [
    {
      name: "Active production POS license",
      passed: harness.activeDecision.allowed === true,
      code: harness.activeDecision.code,
      message: harness.activeDecision.message,
    },
    {
      name: "Terminal capacity enforcement",
      passed: harness.limitDecision.allowed === false,
      code: harness.limitDecision.code,
      message: harness.limitDecision.message,
    },
    {
      name: "Expired POS license enforcement",
      passed: harness.expiredDecision.allowed === false,
      code: harness.expiredDecision.code,
      message: harness.expiredDecision.message,
    },
    {
      name: "Demo local-only license",
      passed: harness.demoDecision.allowed === true,
      code: harness.demoDecision.code,
      message: harness.demoDecision.message,
    },
  ];
}

export function printSCIDiagnostics() {
  const results = runSCIDiagnostics();

  console.table(results);

  const failed = results.filter((result) => !result.passed);

  if (failed.length > 0) {
    console.warn("SCI diagnostics found failures:", failed);
  } else {
    console.info("SCI diagnostics passed.");
  }

  return results;
}
