import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SpreadSheetHelper } from '../../shared/helpers/spread-sheet';
import { ConfigService } from '../config/services/config-service';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { ConfigDetailsService } from './services/config-details';
import { ConfigModel } from '../config/models/config';
import { AppFolderHelper } from '../../shared/helpers/app-folder';
import { EAppFolderNames } from '../../core/enums/folder-names';
import { join } from '@tauri-apps/api/path';
import { EConfigFileNames } from '../../core/enums/file-names';
import { exists } from '@tauri-apps/plugin-fs';
import { Router } from '@angular/router';
import { RouteNavigationHelper } from '../../shared/helpers/route-navigation-helper';

@Component({
    selector: 'app-config-details',
    imports: [FormsModule, CommonModule, ReactiveFormsModule],
    templateUrl: './config-details.html',
    styleUrl: './config-details.scss',
})
export class ConfigDetails {
    selectedFile: File | null = null;
    configForm!: FormGroup;
    submitted = false;

    sheets = [{ name: 'Sheet1' }, { name: 'Sheet2' }, { name: 'Sheet3' }];
    workingSheet: string = '';

    isAddSheetModalOpen = false; // trạng thái mở/đóng modal

    constructor(
        private fb: FormBuilder,
        private configDetailsService: ConfigDetailsService,
        private tauriCommandSerivce: TauriCommandSerivce,
        private router: Router
    ) {}

    ngOnInit() {
        try {
            this.initForm();
        } catch (e) {
            alert(e);
        }
    }

    openModal(flag: boolean) {
        this.isAddSheetModalOpen = flag;
    }

    onSpreadSheetUrlChange(event: Event) {
        const inputValue = (event.target as HTMLInputElement).value;
        const id = SpreadSheetHelper.extractSpreadsheetId(inputValue);

        this.configForm.controls['spreadSheetId'].setValue(id);
    }

    onSelectFile(event: any) {
        const file = event.target.files[0];
        this.selectedFile = file;
    }

    async saveConfig() {
        this.submitted = true;
        if (!this.configForm.valid) {
            return;
        }

        console.log(this.configForm.value);

        console.log(this.selectedFile);

        if (this.selectedFile) {
            await this.configDetailsService.removeCredentialFilee();
            await this.configDetailsService.saveCredentialFile(this.selectedFile);
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
        await this.configDetailsService.saveConfig(configModel);
        await this.init();
    }

    addSheet() {
        const newName = prompt('Nhập tên Sheet mới:');
        if (newName) {
            this.sheets.push({ name: newName });
        }
    }

    saveWorkingSheet() {
        if (!this.workingSheet) {
            alert('Vui lòng chọn 1 sheet!');
            return;
        }
        console.log('Working sheet:', this.workingSheet);
        alert(`Đã lưu "${this.workingSheet}" làm working sheet`);
    }

    private initForm() {
        this.configForm = this.fb.group({
            spreadSheetUrl: ['', [Validators.required]],
            spreadSheetId: ['', [Validators.required]],
        });
    }

    private async init() {
        const checkFileExists = await this.checkConfig();
        if (!checkFileExists) {
            this.router.navigate(RouteNavigationHelper.AUTH.config);
            return;
        }
        const checkInit = await this.initGoogleSheetService();
        if (!checkInit) {
            this.router.navigate(RouteNavigationHelper.AUTH.config);
            return;
        }
    }

    private async initGoogleSheetService(): Promise<boolean> {
        const credentialFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.CredentialDir);
        const credentialPath = await join(
            credentialFolder,
            EConfigFileNames.GOOGLE_CREDENTIAL_FILE_NAME
        );

        const r = await this.tauriCommandSerivce.invokeCommand<boolean>(
            TauriCommandSerivce.INIT_GOOGLE_SHEET_COMMAND,
            { jsonPath: credentialPath }
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
