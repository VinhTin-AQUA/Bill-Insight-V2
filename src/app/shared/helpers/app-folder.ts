import { appLocalDataDir, join } from '@tauri-apps/api/path';
import { exists, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';

export enum EAppFolder {
    DataDir = 'Data',
    ConfigDir = 'Configs',
    CredentialDir = 'Credentials',
}

export class AppFolderHelper {
    private static dataDir: string = '';

    static async getFolderPath(folder: EAppFolder) {
        const dataDir = await this.getDataDir();
        const configDirExists = await exists(folder, {
            baseDir: BaseDirectory.AppLocalData,
        });
        
        if (!configDirExists) {
            await mkdir(folder, {
                baseDir: BaseDirectory.AppLocalData,
            });
        }

        let folderPath = await join(dataDir, folder);
        return folderPath;
    }

    private static async getDataDir() {
        if (this.dataDir) {
            return this.dataDir;
        }
        this.dataDir = await appLocalDataDir();
        return this.dataDir;
    }
}
