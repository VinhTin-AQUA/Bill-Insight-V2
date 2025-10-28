import { Component } from '@angular/core';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { Router } from '@angular/router';
import { AppFolderHelper, EAppFolder } from '../../shared/helpers/app-folder';
import { ConfigService } from './services/config-service';
import { appLocalDataDir, join } from '@tauri-apps/api/path';

@Component({
    selector: 'app-config',
    imports: [],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    constructor(private tauriCommandSerivce: TauriCommandSerivce, 
        private configService: ConfigService,
        private router: Router) {}

    ngOnInit() {
        this.init();
    }

    async init() {
        await this.initGoogleSheetService();
    }

    async initGoogleSheetService() {

       

        // kiểm tra data config đã có chưa
            // nếu có thì init xem thành công không
            // nếu không thì chọn file init lại

        

        // const r = await this.tauriCommandSerivce.invokeCommand<string>(
        //     TauriCommandSerivce.INIT_GOOGLE_SHEET_COMMAND,
        //     { jsonPath: '/home/newtun/Desktop/Secrets/billinsight-0b2c14cec552.json' }
        // );
        // if (r) {
        //     this.router.navigateByUrl('/home');
        // }
    }

    async checkConfig() {
        const r1 = await AppFolderHelper.getFolderPath(EAppFolder.ConfigDir);
        const r2 =await AppFolderHelper.getFolderPath(EAppFolder.CredentialDir);

        console.log(r1);
        console.log(r2);
        

        const checkFileExists = await this.configService.checkConfig();
        console.log(checkFileExists);
        
    }
}
