import { Injectable } from '@angular/core';
import { AppFolderHelper, EAppFolder } from '../../../shared/helpers/app-folder';
import { join } from '@tauri-apps/api/path';
import { ConfigContants } from '../../../shared/const/config';
import { exists, BaseDirectory } from '@tauri-apps/plugin-fs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    constructor(){}

    saveConfig() {}

    async checkConfig(){
        const credentialFolder = await AppFolderHelper.getFolderPath(EAppFolder.CredentialDir);
        const configFolder = await AppFolderHelper.getFolderPath(EAppFolder.ConfigDir);
        
        const credentialPath = await join(credentialFolder, ConfigContants.GOOGLE_CREDENTIAL_FILE_NAME);
        const configPath =  await join(configFolder, ConfigContants.CONFIG_PATH);

        const credentialPathExists = await exists(credentialPath);
        const configPathExists = await exists(configPath);

        return credentialPathExists && configPathExists;
    }
}
