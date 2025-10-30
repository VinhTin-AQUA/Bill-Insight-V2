import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faTrash, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';

@Component({
    selector: 'app-add-invoice',
    imports: [FormsModule, DecimalPipe, FontAwesomeModule],
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

    faArrowsRotate = faArrowsRotate;
    faTrash = faTrash;
    faCirclePlus = faCirclePlus;

    constructor(private tauriCommandSerivce: TauriCommandSerivce) {}

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

    async loadCaptcha() {
        // get captcha
        // send api lấy url tải file xml
        // tải file xml về temp
        // đọc dữ liệu từ file xml

        // get_captcha_and_asp_session
        const r = await this.tauriCommandSerivce.invokeCommand<any>(
            'get_captcha_and_asp_session',
            {}
        );

        console.log(r);
        

        // call API hoặc mock
        // this.captchaImage = 'https://dummyimage.com/120x40/cccccc/000000&text=AB12';
    }

    private numberToWords(num: number): string {
        // đơn giản hóa — bạn có thể thay bằng thư viện đọc số thành chữ tiếng Việt
        return `${num.toLocaleString()} đồng`;
    }
}
