import { Component, signal } from '@angular/core';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { Router } from '@angular/router';
import { ConfigService } from './services/config-service';
import { AppFolderHelper } from '../../shared/helpers/app-folder';
import { EAppFolderNames } from '../../shared/enums/folder-names';
import { EConfigFileNames } from '../../shared/enums/file-names';
import { join } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import {
    ReactiveFormsModule,
    FormControl,
    FormGroup,
    FormBuilder,
    Validators,
} from '@angular/forms';
import { SpreadSheetHelper } from '../../shared/helpers/spread-sheet';
import { ConfigModel } from './models/config';

@Component({
    selector: 'app-config',
    imports: [ReactiveFormsModule],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    selectedFile: File | null = null;
    configForm!: FormGroup;
    submitted = false;

    constructor(
        private tauriCommandSerivce: TauriCommandSerivce,
        private configService: ConfigService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.init();
        this.initForm();
    }

    async saveConfig() {
        this.submitted = true;
        if (!this.configForm.valid) {
            return;
        }

        if (this.selectedFile) {
            this.configService.saveCredentialFile(this.selectedFile);
        }

        const configModel: ConfigModel = {
            spreadSheetId: this.configForm.controls['spreadSheetId'].value,
            spreadSheetUrl: this.configForm.controls['spreadSheetUrl'].value,
            workingSheet: {
                id: -1,
                isActive: false,
                title: '',
            },
        };

        await this.configService.saveConfig(configModel);
    }

    onSelectFile(event: any) {
        const file = event.target.files[0];
        this.selectedFile = file;
    }

    onSpreadSheetUrlChange(event: Event) {
        const inputValue = (event.target as HTMLInputElement).value;
        const id = SpreadSheetHelper.extractSpreadsheetId(inputValue);
        this.configForm.controls['spreadSheetId'].setValue(id);
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

    private initForm() {
        this.configForm = this.fb.group({
            spreadSheetUrl: ['', [Validators.required]],
            spreadSheetId: ['', [Validators.required]],
        });
    }
}
