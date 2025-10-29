import { Component, signal } from '@angular/core';
import { SheetStats as SheetStatsModel } from './models/sheet-stats';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    sheetStats = signal<SheetStatsModel>( {
        used_cash: '0 đ',
        used_bank: '0 đ',
        total_cash: '0 đ',
        total_bank: '0 đ',
        remaining_cash: '0 đ',
        remaining_bank: '0 đ',
        total_remaining: '0 đ',
    })

    constructor(private tauriCommandSerivce: TauriCommandSerivce) {}

    ngOnInit() {
        this.getInvoices();
    }

    async getInvoices() {
        const r = await this.tauriCommandSerivce.invokeCommand<SheetStatsModel>(
            TauriCommandSerivce.GET_SHEET_STATS,
            {}
        );
        console.log(r);
        
        if (r) {
            this.sheetStats.set(r);
        }
    }
}
