/**
 * Native IndexedDB Photo Storage & Client-Side Compression Engine.
 * Zero external dependencies. All photos remain 100% strictly local to the device.
 */

const DB_NAME = 'trailnote_photos_db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open photo database'));
  });
}

/**
 * Compress an image client-side to maximum dimension (default ~1280px) and quality.
 */
export async function compressPhotoFile(
  file: File | Blob,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve({ blob, dataUrl });
          },
          'image/jpeg',
          quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Stores compressed photo Blob in IndexedDB and returns a persistent photoId.
 */
export async function storePhotoBlob(blob: Blob, customId?: string): Promise<string> {
  const photoId = customId || `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const db = await openPhotoDb();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id: photoId,
        blob,
        createdAt: Date.now(),
        size: blob.size,
        type: blob.type,
      };

      const request = store.put(record);

      request.onsuccess = () => resolve(photoId);
      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        if (error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          reject(new Error('Storage quota reached on this device. Please delete older photo notes or export your journal.'));
        } else {
          reject(error || new Error('Failed to save photo into local store'));
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage quota reached';
      reject(new Error(`Storage error: ${msg}. Please remove older notes.`));
    }
  });
}

/**
 * Retrieves a photo Blob by ID.
 */
export async function getPhotoBlob(photoId: string): Promise<Blob | null> {
  const db = await openPhotoDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(photoId);

    request.onsuccess = () => {
      const record = request.result;
      if (record && record.blob) {
        resolve(record.blob);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a photo as a displayable Data URL.
 */
export async function getPhotoDataUrl(photoId: string): Promise<string | null> {
  const blob = await getPhotoBlob(photoId);
  if (!blob) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Deletes a photo from IndexedDB.
 */
export async function deletePhoto(photoId: string): Promise<void> {
  const db = await openPhotoDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(photoId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
