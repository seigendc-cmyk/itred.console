import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";

import type {
  SCIVendor,
  SCICompany,
  SCIBranch,
  SCIWarehouse,
  SCIActivationRequest,
  SCIRPNAgent,
  SCIAuditLog,
} from "../../domain";

export const VENDOR_COLLECTIONS = {
  vendors: "vendors",
  companies: "companies",
  branches: "branches",
  warehouses: "warehouses",
  activationRequests: "activation_requests",
  rpnAgents: "rpn_agents",
  auditLogs: "audit_logs",
} as const;

async function listCollection<T>(db: Firestore, collectionName: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => item.data() as T);
}

async function listByField<T>(
  db: Firestore,
  collectionName: string,
  fieldName: string,
  value: string
): Promise<T[]> {
  const q = query(collection(db, collectionName), where(fieldName, "==", value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => item.data() as T);
}

async function upsertDocument<T extends Record<string, unknown>>(
  db: Firestore,
  collectionName: string,
  id: string,
  value: T
) {
  await setDoc(doc(db, collectionName, id), value, { merge: true });
  return value;
}

export function createVendorFirestoreRepository(db: Firestore) {
  return {
    listVendors: () =>
      listCollection<SCIVendor>(db, VENDOR_COLLECTIONS.vendors),

    listVendorsByOwner: (ownerUid: string) =>
      listByField<SCIVendor>(
        db,
        VENDOR_COLLECTIONS.vendors,
        "ownerUid",
        ownerUid
      ),

    upsertVendor: (vendor: SCIVendor) =>
      upsertDocument(db, VENDOR_COLLECTIONS.vendors, vendor.vendorId, {
        ...vendor,
      } as unknown as Record<string, unknown>),

    listCompanies: () =>
      listCollection<SCICompany>(db, VENDOR_COLLECTIONS.companies),

    listCompaniesByVendor: (vendorId: string) =>
      listByField<SCICompany>(
        db,
        VENDOR_COLLECTIONS.companies,
        "vendorId",
        vendorId
      ),

    upsertCompany: (company: SCICompany) =>
      upsertDocument(db, VENDOR_COLLECTIONS.companies, company.companyId, {
        ...company,
      } as unknown as Record<string, unknown>),

    listBranches: () =>
      listCollection<SCIBranch>(db, VENDOR_COLLECTIONS.branches),

    listBranchesByVendor: (vendorId: string) =>
      listByField<SCIBranch>(
        db,
        VENDOR_COLLECTIONS.branches,
        "vendorId",
        vendorId
      ),

    upsertBranch: (branch: SCIBranch) =>
      upsertDocument(db, VENDOR_COLLECTIONS.branches, branch.branchId, {
        ...branch,
      } as unknown as Record<string, unknown>),

    listWarehouses: () =>
      listCollection<SCIWarehouse>(db, VENDOR_COLLECTIONS.warehouses),

    listWarehousesByVendor: (vendorId: string) =>
      listByField<SCIWarehouse>(
        db,
        VENDOR_COLLECTIONS.warehouses,
        "vendorId",
        vendorId
      ),

    upsertWarehouse: (warehouse: SCIWarehouse) =>
      upsertDocument(db, VENDOR_COLLECTIONS.warehouses, warehouse.warehouseId, {
        ...warehouse,
      } as unknown as Record<string, unknown>),

    listActivationRequests: () =>
      listCollection<SCIActivationRequest>(
        db,
        VENDOR_COLLECTIONS.activationRequests
      ),

    upsertActivationRequest: (request: SCIActivationRequest) =>
      upsertDocument(
        db,
        VENDOR_COLLECTIONS.activationRequests,
        request.requestId,
        {
          ...request,
        } as unknown as Record<string, unknown>
      ),

    listRPNAgents: () =>
      listCollection<SCIRPNAgent>(db, VENDOR_COLLECTIONS.rpnAgents),

    upsertRPNAgent: (agent: SCIRPNAgent) =>
      upsertDocument(db, VENDOR_COLLECTIONS.rpnAgents, agent.rpnId, {
        ...agent,
      } as unknown as Record<string, unknown>),

    listAuditLogs: () =>
      listCollection<SCIAuditLog>(db, VENDOR_COLLECTIONS.auditLogs),

    upsertAuditLog: (log: SCIAuditLog) =>
      upsertDocument(db, VENDOR_COLLECTIONS.auditLogs, log.auditId, {
        ...log,
      } as unknown as Record<string, unknown>),
  };
}
