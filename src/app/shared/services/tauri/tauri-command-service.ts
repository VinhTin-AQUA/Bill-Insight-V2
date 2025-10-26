import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandSerivce {
    static readonly INIT_GOOGLE_SHEET_COMMAND = 'init_google_sheet_command';

    async invokeCommand<T>(cmd: string, params: any): Promise<T | null> {
        try {
            const initOk = await invoke<T>(cmd, params);
            return initOk;
        } catch (e) {
            alert(e);
            return null;
        }
    }
}
