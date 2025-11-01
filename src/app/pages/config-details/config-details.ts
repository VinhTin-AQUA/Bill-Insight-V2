import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SpreadSheetHelper } from '../../shared/helpers/spread-sheet';
import { SpreadsheetConfigService } from '../../shared/services/config-service';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { SpreadsheetConfigModel } from '../../shared/models/spreadsheet_config';
import { AppFolderHelper } from '../../shared/helpers/app-folder';
import { EAppFolderNames } from '../../core/enums/folder-names';
import { join } from '@tauri-apps/api/path';
import { EConfigFileNames } from '../../core/enums/file-names';
import { exists } from '@tauri-apps/plugin-fs';
import { Router } from '@angular/router';
import { RouteNavigationHelper } from '../../shared/helpers/route-navigation-helper';
import { FileHelper } from '../../shared/helpers/file-helper';
import { SpreadsheetConfigStore } from '../../shared/stores/config-store';
import { SheetInfo } from './models/sheet-info';

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

    sheets = signal<SheetInfo[]>([]);

    isAddSheetModalOpen = false; // trạng thái mở/đóng modal
    spreadsheetConfigStore = inject(SpreadsheetConfigStore);
    newSheetName: string = '';

    constructor(
        private fb: FormBuilder,
        private spreadsheetConfigService: SpreadsheetConfigService,
        private tauriCommandSerivce: TauriCommandSerivce,
        private router: Router
    ) {}

    ngOnInit() {
        try {
            this.initForm();
            this.getListSheets();
        } catch (e) {
            alert(e);
        }
    }

    ngOnViewInit() {
        this.updateForm();
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
            await this.spreadsheetConfigService.removeCredentialFilee();
            await this.spreadsheetConfigService.saveCredentialFile(this.selectedFile);
        }

        const configModel: SpreadsheetConfigModel = {
            spreadSheetId: this.configForm.controls['spreadSheetId'].value,
            spreadSheetUrl: this.configForm.controls['spreadSheetUrl'].value,
            workingSheet: {
                id: -1,
                isActive: false,
                title: '',
            },
        };
        await this.spreadsheetConfigService.saveConfig(configModel);
        await this.init();
    }

    addSheet() {
        alert(this.newSheetName);
    }

    async saveWorkingSheet() {
        const configModel: SpreadsheetConfigModel = {
            spreadSheetId: this.spreadsheetConfigStore.spreadSheetId(),
            spreadSheetUrl: this.spreadsheetConfigStore.spreadSheetUrl(),
            workingSheet: {
                id: this.spreadsheetConfigStore.workingSheet().id,
                isActive: true,
                title: this.spreadsheetConfigStore.workingSheet().title,
            },
        };

        await this.spreadsheetConfigService.saveConfig(configModel);
    }

    onChangeWorkingSheet(item: SheetInfo) {
        this.spreadsheetConfigStore.updateWorkingSheet(item.sheet_id, item.title);
    }

    private initForm() {
        this.configForm = this.fb.group({
            spreadSheetUrl: ['', [Validators.required]],
            spreadSheetId: ['', [Validators.required]],
        });
    }

    private updateForm() {
        this.configForm.controls['spreadSheetUrl'].setValue(
            this.spreadsheetConfigStore.spreadSheetUrl()
        );
        this.configForm.controls['spreadSheetId'].setValue(
            this.spreadsheetConfigStore.spreadSheetId()
        );
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

        const spreadsheetConfig = await FileHelper.getObjectFromFile<SpreadsheetConfigModel>(
            configPath
        );
        if (spreadsheetConfig) {
            this.spreadsheetConfigStore.update(spreadsheetConfig);
        }

        return credentialPathExists && configPathExists;
    }

    private async getListSheets() {
        const r = await this.tauriCommandSerivce.invokeCommand<SheetInfo[]>(
            TauriCommandSerivce.LIST_SHEETS,
            { spreadsheetId: this.spreadsheetConfigStore.spreadSheetId() }
        );
        if (r) {
            this.sheets.set(r);
        }
    }
}
