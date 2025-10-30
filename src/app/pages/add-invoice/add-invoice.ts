import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faTrash, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { TauriCommandSerivce } from '../../shared/services/tauri/tauri-command-service';
import { CaptchaSession } from './models/captcha-session';
import { AppFolderHelper } from '../../shared/helpers/app-folder';
import { EAppFolderNames } from '../../core/enums/folder-names';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ReadXmlDataResult } from './models/xml_data';

@Component({
    selector: 'app-add-invoice',
    imports: [FormsModule, DecimalPipe, FontAwesomeModule],
    templateUrl: './add-invoice.html',
    styleUrl: './add-invoice.scss',
})
export class AddInvoice {
    seller = { mst: '3423542534', address: '123 Thong Nhat Street', phone: '98765432', other: '' };
    captchaInput = '';
    invoiceCode = '';
    invoiceCT = '';
    invoiceItems = [{ name: '', price: 0 }];
    extraItems = [{ name: '', price: 0 }];
    invoiceDate = new Date().toISOString().substring(0, 10);

    faArrowsRotate = faArrowsRotate;
    faTrash = faTrash;
    faCirclePlus = faCirclePlus;
    captchaSession = signal<CaptchaSession>({
        aspnet_session_id: '',
        captcha_path: '',
        sv_id: '',
    });

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
        const tempFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.TempDir);
        const captcha_and_asp_session =
            await this.tauriCommandSerivce.invokeCommand<CaptchaSession>(
                TauriCommandSerivce.GET_CAPTCHA_AND_ASP_SESSION,
                { folder: tempFolder }
            );

        if (!captcha_and_asp_session) {
            return;
        }

        this.captchaSession.set({
            captcha_path: convertFileSrc(captcha_and_asp_session.captcha_path),
            aspnet_session_id: captcha_and_asp_session.aspnet_session_id,
            sv_id: captcha_and_asp_session.sv_id,
        });
    }

    async getInvoiceInfo() {
        const tempFolder = await AppFolderHelper.getFolderPath(EAppFolderNames.TempDir);
        const xml_data = await this.tauriCommandSerivce.invokeCommand<ReadXmlDataResult>(
            TauriCommandSerivce.GET_XML_INVOICE_DATA,
            {
                svId: this.captchaSession().sv_id,
                aspSession: this.captchaSession().aspnet_session_id,
                captcha: this.captchaInput,
                phone: this.invoiceCT,
                invoiceNum: this.invoiceCode,
                folder: tempFolder,
            }
        );

        console.log(xml_data);
    }

    private numberToWords(num: number): string {
        // đơn giản hóa — bạn có thể thay bằng thư viện đọc số thành chữ tiếng Việt
        return `${num.toLocaleString()} đồng`;
    }
}
