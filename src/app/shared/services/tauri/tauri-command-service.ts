import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { DialogService } from '../dialog-service';

@Injectable({
    providedIn: 'root',
})
export class TauriCommandSerivce {
    static readonly INIT_GOOGLE_SHEET_COMMAND = 'init_google_sheet_command';
    static readonly GET_INVOICES = 'get_invoices';
    static readonly GET_SHEET_STATS = 'get_sheet_stats';
    static readonly GET_CAPTCHA_AND_ASP_SESSION = 'get_captcha_and_asp_session';
    static readonly GET_XML_INVOICE_DATA = 'get_xml_invoice_data';
    static readonly SET_INVOICES = 'set_invoices';
    static readonly LIST_SHEETS = 'list_sheets';

    constructor(private dialogService: DialogService) {}

    async invokeCommand<T>(cmd: string, params: any): Promise<T | null> {
        console.log(123);
        
        this.dialogService.showLoadingDialog(true);

        try {
            console.log(345);

            const initOk = await invoke<T>(cmd, params);

            console.log(456);

            this.dialogService.showLoadingDialog(false);

            console.log("initOk: ", initOk);
            
            return initOk;
        } catch (e) {
            alert(e);
            console.log("e: ", e);
            this.dialogService.showLoadingDialog(false);
            return null;
        }
    }
}
