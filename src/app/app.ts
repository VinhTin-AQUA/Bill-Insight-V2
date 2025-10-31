import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingDialog } from './shared/components/ui/loading-dialog/loading-dialog';
import { DialogService } from './shared/services/dialog-service';
import { NoticeDialog } from "./shared/components/ui/notice-dialog/notice-dialog";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoadingDialog, NoticeDialog],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('BillInsight');

    constructor(public dialogService: DialogService) {
        
    }
}
