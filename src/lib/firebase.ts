// Mock Firebase / Firestore database layer for prototype
// Saves simulated collection records inside localStorage keys.

class MockFirestore {
  private getStorageKey(collectionName: string): string {
    return `sgn_firestore_${collectionName}`;
  }

  load(collectionName: string): any[] {
    const saved = localStorage.getItem(this.getStorageKey(collectionName));
    return saved ? JSON.parse(saved) : [];
  }

  save(collectionName: string, data: any[]) {
    localStorage.setItem(this.getStorageKey(collectionName), JSON.stringify(data));
  }

  async addDoc(collectionName: string, docData: any): Promise<{ id: string }> {
    const data = this.load(collectionName);
    const id = `${collectionName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc = { ...docData, id };
    data.push(newDoc);
    this.save(collectionName, data);
    return { id };
  }

  async getDocs(collectionName: string): Promise<any[]> {
    return this.load(collectionName);
  }

  async updateDoc(collectionName: string, docId: string, updatedData: any): Promise<void> {
    const data = this.load(collectionName);
    const index = data.findIndex(item => item.id === docId || item.licenseId === docId);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedData, updatedAt: new Date().toISOString() };
      this.save(collectionName, data);
    }
  }

  async setDoc(collectionName: string, docId: string, docData: any): Promise<void> {
    const data = this.load(collectionName);
    const index = data.findIndex(item => item.id === docId || item.licenseId === docId);
    const docWithId = { ...docData, id: docId };
    if (index !== -1) {
      data[index] = docWithId;
    } else {
      data.push(docWithId);
    }
    this.save(collectionName, data);
  }
}

export const db = new MockFirestore();
export const firebaseApp = { name: "MockFirebaseAppPrototype" };
