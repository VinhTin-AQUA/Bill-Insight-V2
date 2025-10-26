import { Component } from '@angular/core';

import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';

@Component({
    selector: 'app-config',
    imports: [],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    constructor(private tauriCommandSerivce: TauriCommandSerivce) {}

    ngOnInit() {
        this.init();
    }

    async init() {
        const r = await this.tauriCommandSerivce.invokeCommand<boolean>(
            TauriCommandSerivce.INIT_GOOGLE_SHEET_COMMAND,
            { jsonPath: 'C:/Users/tinhv/Downloads/billinsight-0b2c14cec552.json' }
        );
    }

    async test() {
        const r = await this.tauriCommandSerivce.invokeCommand<string>(
            TauriCommandSerivce.INIT_GOOGLE_SHEET_COMMAND,
            { jsongPath: 'C:/Users/tinhv/Downloads/billinsight-0b2c14cec552.json' }
        );
        alert(r);
    }
}
