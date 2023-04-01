import { ServerAPI } from 'decky-frontend-lib';
import localforage from 'localforage';

const database = 'gameview-music';

localforage.config({
    name: database,
});

export const keyDatabase = "database"

export async function updateCache<T>(key: string, value: T) {
    await localforage.setItem(key, value);
}

export async function getCache<T>(key: string): Promise<T | null> {
    return await localforage.getItem<T>(key);
}

export const clearCache = () => {
    localforage.clear();
};

type APIResult = { body: string; status: number };
export type Database = {
    app_id: Map<string, Item>;
}

type Item = {
    url: string
}

export async function loadDatabase (serverApi: ServerAPI) {
    console.debug("Loading database")
    const url: string = "https://raw.githubusercontent.com/lcd1232/gameview-music-data/main/v1/data.json";
    const res = await serverApi.fetchNoCors<{ body: string; status: number }>(
        url,
        {
            method: "GET",
            headers: {
                "User-Agent": "Chrome: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
            }
        }
    );
    const result = res.result as APIResult;
    if (result.status === 200) {
        const data: Database = JSON.parse(result.body);
        updateCache(keyDatabase, data);
    } else {
        console.error(result)
    }
};