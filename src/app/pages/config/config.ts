import { Component } from '@angular/core';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { Router } from '@angular/router';
import { ConfigService } from './services/config-service';
import { AppFolderHelper } from '../../shared/helpers/app-folder';
import { EAppFolderNames } from '../../shared/enums/folder-names';
import { EConfigFileNames } from '../../shared/enums/file-names';
import { join } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';

@Component({
    selector: 'app-config',
    imports: [],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    constructor(
        private tauriCommandSerivce: TauriCommandSerivce,
        private configService: ConfigService,
        private router: Router
    ) {}

    ngOnInit() {
        this.init();
    }

    private async init() {
        const checkFileExists = await this.checkConfig();
        if (!checkFileExists) {
            return;
        }

        const checkInit = await this.initGoogleSheetService();
        if (!checkInit) {
            return;
        }

        this.router.navigateByUrl('/home');
    }

    async saveConfig() {
        
    }


    /* private methods */

    private async initGoogleSheetService(): Promise<boolean> {
        const r = await this.tauriCommandSerivce.invokeCommand<boolean>(
            TauriCommandSerivce.INIT_GOOGLE_SHEET_COMMAND,
            { jsonPath: '/home/newtun/Desktop/Secrets/billinsight-0b2c14cec552.json' }
        );
        return r === true;
    }

    private async checkConfig(): Promise<boolean> {
        const credentialFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.CredentialDir);
        const configFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.ConfigDir);

        const credentialPath = await join(
            credentialFolder,
            EConfigFileNames.GOOGLE_CREDENTIAL_FILE_NAME
        );
        const configPath = await join(configFolder, EConfigFileNames.CONFIG_PATH);

        const credentialPathExists = await exists(credentialPath);
        const configPathExists = await exists(configPath);

        return credentialPathExists && configPathExists;
    }
}
