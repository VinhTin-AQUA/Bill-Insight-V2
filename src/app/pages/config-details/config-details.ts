import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-config-details',
    imports: [FormsModule, CommonModule],
    templateUrl: './config-details.html',
    styleUrl: './config-details.scss',
})
export class ConfigDetails {
    config = {
        spreadsheetId: '',
        spreadsheetUrl: '',
        credentialPath: '',
    };

    sheets = [{ name: 'Sheet1' }, { name: 'Sheet2' }, { name: 'Sheet3' }];
    workingSheet: string = '';

    isAddSheetModalOpen = false; // trạng thái mở/đóng modal

    saveConfig() {
        console.log('Cấu hình đã lưu:', this.config);
        alert('Đã lưu cấu hình Spreadsheet!');
    }

    addSheet() {
        const newName = prompt('Nhập tên Sheet mới:');
        if (newName) {
            this.sheets.push({ name: newName });
        }
    }

    saveWorkingSheet() {
        if (!this.workingSheet) {
            alert('Vui lòng chọn 1 sheet!');
            return;
        }
        console.log('Working sheet:', this.workingSheet);
        alert(`Đã lưu "${this.workingSheet}" làm working sheet`);
    }

    openModal(flag: boolean) {
        this.isAddSheetModalOpen = flag;
    }
}
