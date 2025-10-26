import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Component({
    selector: 'app-config',
    imports: [],
    templateUrl: './config.html',
    styleUrl: './config.scss',
})
export class Config {
    ngOnInit() {
        this.init();
    }

    async init() {
        try {
            const initOk = await invoke<any>('init_google_sheet_command', {
                jsonPath: 'C:/Users/tinhv/Downloads/billinsight-0b2c14cec552.json',
            });
            alert(initOk);
        } catch (e) {
            alert(e);
        }
    }

    async test() {
        try {
            const initOk = await invoke<any>('init_google_sheet_command', {
                jsonPath: 'C:/Users/tinhv/Downloads/billinsight-0b2c14cec552.json',
            });
            alert(initOk);
        } catch (e) {
            alert(e);
        }
    }
}
