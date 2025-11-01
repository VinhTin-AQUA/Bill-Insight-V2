import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

export class FileHelper {
    static async getObjectFromFile<T>(filePath: string): Promise<T | null> {
        try {
            const jsonString = await readTextFile(filePath);
            const data = JSON.parse(jsonString) as T;
            return data;
        } catch {
            return null;
        }
    }
}
