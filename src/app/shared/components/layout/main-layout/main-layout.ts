import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavItem } from './models/nav-item';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout {
    isDrawerOpen = false;

    navItems: NavItem[] = [];

    constructor() {}

    ngOnInit() {
        this.navItems = [
            {
                name: 'Home',
                url: '/home',
            },
            {
                name: 'Invoices',
                url: '/invoices',
            },
            {
                name: 'Add Invoice',
                url: '/add-invoice',
            },
            {
                name: 'Config',
                url: '/config-details',
            },
            {
                name: 'Settings',
                url: '/settings',
            },
        ];
    }

    toggleDrawer() {
        this.isDrawerOpen = !this.isDrawerOpen;

        // Thêm / gỡ class overflow-hidden để khóa scroll khi drawer mở
        if (this.isDrawerOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }
}
