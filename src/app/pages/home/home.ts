import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-home',
    imports: [DecimalPipe],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    totalCash = 5000000;
    usedCash = 2000000;
    totalBank = 10000000;
    usedBank = 4000000;
    remainingCash = 1000;
    remainingBank = 2000;
    totalRemaining = 30000;
}
