import { Injectable } from '@angular/core';
import { AppFolderHelper } from '../../../shared/helpers/app-folder';
import { join } from '@tauri-apps/api/path';
import { exists } from '@tauri-apps/plugin-fs';
import { EAppFolderNames } from '../../../shared/enums/folder-names';
import { EConfigFileNames } from '../../../shared/enums/file-names';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    constructor(){}

    saveConfig() {}
}
