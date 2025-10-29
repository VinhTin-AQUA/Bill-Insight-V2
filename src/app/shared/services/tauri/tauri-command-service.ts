import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandSerivce {
    static readonly INIT_GOOGLE_SHEET_COMMAND = 'init_google_sheet_command';
    static readonly GET_INVOICES = 'get_invoices';
    static readonly GET_SHEET_STATS = 'get_sheet_stats';

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
