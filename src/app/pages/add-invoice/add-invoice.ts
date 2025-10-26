import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-invoice',
    imports: [FormsModule, DecimalPipe],
    templateUrl: './add-invoice.html',
    styleUrl: './add-invoice.scss',
})
export class AddInvoice {
    seller = { mst: '3423542534', address: '123 Thong Nhat Street', phone: '98765432', other: '' };
    captchaImage: string | null = null;
    captchaInput = '';
    invoiceCode = '';
    invoiceCT = '';
    invoiceItems = [{ name: '', price: 0 }];
    extraItems = [{ name: '', price: 0 }];
    invoiceDate = new Date().toISOString().substring(0, 10);

    get totalBeforeTax() {
        return [...this.invoiceItems, ...this.extraItems].reduce(
            (a, b) => a + (Number(b.price) || 0),
            0
        );
    }

    get tax() {
        return this.totalBeforeTax * 0.1; // giả sử VAT 10%
    }

    get totalAfterTax() {
        return this.totalBeforeTax + this.tax;
    }

    get totalInWords() {
        return this.numberToWords(this.totalAfterTax);
    }

    ngOnInit() {}

    loadCaptcha() {
        // call API hoặc mock
        this.captchaImage = 'https://dummyimage.com/120x40/cccccc/000000&text=AB12';
    }

    getInvoiceInfo() {
        alert('Nhận thông tin hóa đơn...');
    }

    addInvoiceItem() {
        this.invoiceItems.push({ name: '', price: 0 });
    }

    removeInvoiceItem(index: number) {
        this.invoiceItems.splice(index, 1);
    }

    addExtraItem() {
        this.extraItems.push({ name: '', price: 0 });
    }

    removeExtraItem(index: number) {
        this.extraItems.splice(index, 1);
    }

    saveInvoice() {
        console.log({
            seller: this.seller,
            invoiceItems: this.invoiceItems,
            extraItems: this.extraItems,
            total: this.totalAfterTax,
            date: this.invoiceDate,
        });
        alert('Hóa đơn đã được lưu!');
    }

    private numberToWords(num: number): string {
        // đơn giản hóa — bạn có thể thay bằng thư viện đọc số thành chữ tiếng Việt
        return `${num.toLocaleString()} đồng`;
    }
}
