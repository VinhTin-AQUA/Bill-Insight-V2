import { Injectable } from '@angular/core';
import { AppFolderHelper } from '../../../shared/helpers/app-folder';
import { join } from '@tauri-apps/api/path';
import { writeFile, writeTextFile, remove } from '@tauri-apps/plugin-fs';
import { EConfigFileNames } from '../../../core/enums/file-names';
import { EAppFolderNames } from '../../../core/enums/folder-names';
import { ConfigModel } from '../../config/models/config';

@Injectable({
    providedIn: 'root',
})
export class ConfigDetailsService {
    constructor() {}

    async saveCredentialFile(file: File) {
        const credentialFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.CredentialDir);
        const credentialPath = await join(
            credentialFolder,
            EConfigFileNames.GOOGLE_CREDENTIAL_FILE_NAME
        );

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target?.result as ArrayBuffer;
            const uint8 = new Uint8Array(data);

            if (data) {
                await writeFile(credentialPath, uint8);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    async saveConfig(config: ConfigModel) {
        const content = JSON.stringify(config, null, 2);
        const configFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.ConfigDir);
        const configPath = await join(configFolder, EConfigFileNames.CONFIG_PATH);
        await writeTextFile(configPath, content);
    }

    async removeCredentialFilee() {
        const credentialFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.CredentialDir);
        const credentialPath = await join(
            credentialFolder,
            EConfigFileNames.GOOGLE_CREDENTIAL_FILE_NAME
        );
        console.log(credentialPath);
        
        await remove(credentialPath);
    }
}
