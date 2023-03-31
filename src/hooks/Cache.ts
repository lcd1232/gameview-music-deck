import localforage from 'localforage';

const database = 'gameview-music';

localforage.config({
    name: database,
});

export async function updateCache<T>(key: string, value: T) {
    await localforage.setItem(key, value);
}

export async function getCache<T>(key: string): Promise<T | null> {
    return await localforage.getItem<T>(key);
}

export const clearCache = () => {
    localforage.clear();
};