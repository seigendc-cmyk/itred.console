import { safeFirestoreWrite } from "../gateway";
import { buildFirestoreSeedBundles } from "./firestoreSeedExporter";

type UpsertSeedRecord = (collectionName: string, record: unknown) => Promise<unknown>;

export async function writeFirestoreSeedPreviewOnly(
  upsertSeedRecord: UpsertSeedRecord
) {
  return safeFirestoreWrite(async () => {
    const bundles = buildFirestoreSeedBundles();
    const results: unknown[] = [];

    for (const bundle of bundles) {
      for (const record of bundle.records) {
        results.push(await upsertSeedRecord(bundle.collectionName, record));
      }
    }

    return {
      writtenAt: new Date().toISOString(),
      bundles: bundles.length,
      records: results.length,
    };
  });
}
