import { Component } from '@angular/core';

import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-config',
    imports: [],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    constructor(private tauriCommandSerivce: TauriCommandSerivce, private router: Router) {}

    ngOnInit() {
        this.init();
    }

    async init() {
        await this.initGoogleSheetService();
    }

    async initGoogleSheetService() {
        const r = await this.tauriCommandSerivce.invokeCommand<string>(
            TauriCommandSerivce.INIT_GOOGLE_SHEET_COMMAND,
            { jsonPath: '/home/newtun/Desktop/Secrets/billinsight-0b2c14cec552.json' }
        );
        if (r) {
            this.router.navigateByUrl('/home');
        }
    }

   
}
