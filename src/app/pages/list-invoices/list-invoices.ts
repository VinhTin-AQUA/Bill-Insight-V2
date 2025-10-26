import { Component } from '@angular/core';
import { ProductGroupByDate } from './models/product';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-list-invoices',
    imports: [DatePipe, DecimalPipe],
    templateUrl: './list-invoices.html',
    styleUrl: './list-invoices.scss',
})
export class ListInvoices {
    productGroups: ProductGroupByDate[] = [
        {
            date: '2025-10-25',
            products: [
                { name: 'Sản phẩm A', cash: 200000, bank: 150000 },
                { name: 'Sản phẩm B', cash: 100000, bank: 50000 },
            ],
        },
        {
            date: '2025-10-26',
            products: [
                { name: 'Sản phẩm C', cash: 300000, bank: 0 },
                { name: 'Sản phẩm D', cash: 0, bank: 250000 },
            ],
        },
    ];

    getTotalCash(products: any[]) {
        return products.reduce((sum, p) => sum + p.cash, 0);
    }

    getTotalBank(products: any[]) {
        return products.reduce((sum, p) => sum + p.bank, 0);
    }
}
