import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavItem } from './models/nav-item';
import { filter } from 'rxjs';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout {
    isDrawerOpen = false;

    navItems: NavItem[] = [];

    constructor(private router: Router) {}

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

        // 👇 Lắng nghe sự kiện điều hướng xong thì đóng drawer
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            if (this.isDrawerOpen) {
                this.toggleDrawer();
            }
        });
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
