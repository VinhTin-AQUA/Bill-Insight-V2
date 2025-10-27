import { Component, signal } from '@angular/core';
import { InvoiceItem, ListInvoiceItems } from './models/invoice-item';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';

@Component({
    selector: 'app-list-invoices',
    imports: [DatePipe, DecimalPipe],
    templateUrl: './list-invoices.html',
    styleUrl: './list-invoices.scss',
})
export class ListInvoices {
    productGroups = signal<ListInvoiceItems[]>([]);

    constructor(private tauriCommandSerivce: TauriCommandSerivce) {}

    ngOnInit() {
        this.getInvoices();
    }

    async getInvoices() {
        const r = await this.tauriCommandSerivce.invokeCommand<ListInvoiceItems[]>(
            TauriCommandSerivce.GET_INVOICES,
            {}
        );

        if (r) {
            this.productGroups.set([...r]);
        } else {
            alert('null');
        }
    }

    getTotalCash(products: InvoiceItem[]) {
        return products.reduce((sum, p) => sum + p.cash_price, 0);
    }

    getTotalBank(products: InvoiceItem[]) {
        return products.reduce((sum, p) => sum + p.bank_price, 0);
    }
}
