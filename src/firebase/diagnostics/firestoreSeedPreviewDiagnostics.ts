import { exportFirestoreSeedPreview } from "../seed";

export interface SCIFirestoreSeedDiagnostic {
  name: string;
  collectionName: string;
  recordCount: number;
  writeProtected: boolean;
  message: string;
}

export function runFirestoreSeedPreviewDiagnostics(): SCIFirestoreSeedDiagnostic[] {
  const preview = exportFirestoreSeedPreview();

  return preview.bundles.map((bundle) => ({
    name: `Seed Preview: ${bundle.collectionName}`,
    collectionName: bundle.collectionName,
    recordCount: bundle.records.length,
    writeProtected: preview.firebaseWritesAllowed === false,
    message: `${bundle.records.length} records prepared for ${bundle.collectionName}. Writes are disabled in preview mode.`,
  }));
}
