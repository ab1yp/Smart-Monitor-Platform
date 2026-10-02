import { ChangeDetectorRef, Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth';
import { UsersService } from '../../../features/users/services/users';
import { DevicesService } from '../../../features/devices/services/devices';
import { User } from '../../interfaces/user';
import { Device } from '../../interfaces/device';

type Context = 'ml' | 'dl';

interface NavItem {
  label: string;
  route: string[];
  icon: string;
  badge?: number;
  exact?: boolean;
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, NgClass,],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
})

export class SideNav implements OnInit, OnChanges, OnDestroy {

  @Input() context: Context = 'ml';
  @Input() deviceId?: string | null;

  userData: User | undefined;
  contextData: any;
  mobileOpen = false;
  userMenu = false;
  collapsed = false;
  isDark = false;
  searchQuery = '';

  private initialized = false;
  private readonly destroy$ = new Subject<void>();
  private readonly COLLAPSE_KEY = 'side-nav.collapsed';
  private readonly THEME_KEY = 'theme';

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly devicesService: DevicesService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.users.getUser().pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ responseData }: any) => {
        this.userData = responseData
        this.restoreCollapsed();
        this.restoreTheme();
        this.loadContext();
        this.initialized = true;
        this.cdr.detectChanges()
      },
      error: error => {
        console.error('Failed to load user:', error);
        this.userData = undefined;
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;
    if (changes['context'] || changes['deviceId']) {
      this.loadContext();
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  get title(): string {
    if (this.context === 'dl' && this.contextData?.name) {
      return this.contextData.name;
    } return 'SMP';
  }

  get subtitle(): string | undefined {
    if (this.context === 'dl') {
      if (!this.deviceId) return 'Device';
      this.cdr.detectChanges()
      return this.contextData?.device.serialNumber
    }
    return 'Smart Monitor Platform';
  }

  get members(): number { return 0; }

  get navItems(): NavItem[] {
    if (this.context === 'dl' && this.deviceId) {
      const base = ['/dl', this.deviceId];
      return [
        { label: 'Overview', route: [...base, 'dashboard'], icon: '⌂', exact: true },
      ];
    } else {
      return [
        { label: 'Dashboard', route: ['/ml/main'], icon: '⌂', exact: true },
        { label: 'Devices', route: ['/ml/devices'], icon: '🇦🇨' },
      ];
    }
  }

  get manageItems(): NavItem[] {
    if (this.context === 'dl' && this.deviceId) {
      return [
        { label: 'Settings', route: ['/dl', this.deviceId, 'settings',], icon: '🌣', },
      ];
    }
    return [
      { label: 'Profile', route: ['/ml/user/profile',], icon: '○', },
      { label: 'Settings', route: ['/ml/settings',], icon: '🌣', },
    ];
  }

  get filteredNavItems(): NavItem[] {
    return this.filterByQuery(this.navItems);
  }

  get filteredManageItems(): NavItem[] {
    return this.filterByQuery(this.manageItems);
  }

  get hasResults(): boolean {
    return (this.filteredNavItems.length > 0 || this.filteredManageItems.length > 0);
  }

  private filterByQuery(items: NavItem[]): NavItem[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) { return items; }
    return items.filter(
      item => item.label.toLowerCase().includes(query)
    );
  }

  clearSearch(): void { this.searchQuery = ''; }
  private loadContext(): void {

    if (this.context !== 'dl' || !this.deviceId) {
      this.contextData = null; return;
    }

    this.contextData = null;
    const deviceId = this.deviceId;

    this.devicesService.getDevice(deviceId).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ responseData }: any) => {
        if (this.deviceId !== deviceId) { return; }
        this.contextData = responseData;
        this.cdr.detectChanges()

      },
      error: error => {
        console.error('Failed to load device:', error);
        if (this.deviceId === deviceId) { this.contextData = null; }
      },
    });
  }

  back(): void {
    this.close();
    this.router.navigate(['/ml/devices',]); return;

  }

  open(): void { this.mobileOpen = true; }

  close(): void { this.mobileOpen = false; this.userMenu = false; }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.saveStorage(this.COLLAPSE_KEY, String(this.collapsed));
  }

  private restoreCollapsed(): void {
    const value = this.getStorage(this.COLLAPSE_KEY);
    this.collapsed = value === 'true';
  }

  private restoreTheme(): void {
    const storedTheme = this.getStorage(this.THEME_KEY);
    if (storedTheme === 'dark') { this.setDarkMode(true); return; }
    if (storedTheme === 'light') { this.setDarkMode(false); return; }
    this.isDark = document.documentElement.classList.contains('dark');
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDark);

    this.saveStorage(this.THEME_KEY, this.isDark ? 'dark' : 'light');
  }

  private setDarkMode(enabled: boolean): void {
    this.isDark = enabled;
    document.documentElement.classList.toggle('dark', enabled);
  }

  toggleUser(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenu = !this.userMenu;
    this.cdr.detectChanges()
  }

  logout(): void {
    this.close();
    this.auth.logout().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.router.navigate(['/al',]); },
        error: error => {
          console.error('Logout failed:', error);
          this.router.navigate(['/al',]);
        },
      });
  }

  private getStorage(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  private saveStorage(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { }
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.userMenu = false; }
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.userMenu) { this.userMenu = false; return; }
    if (this.mobileOpen) { this.close(); }
  }

  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    const modifier = event.ctrlKey || event.metaKey;
    if (!modifier) { return; }
    const key = event.key.toLowerCase();
    if (key === 'k') {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('input[aria-label="Search navigation"]')?.focus();
      return;
    }
    if (key === 'b') { event.preventDefault(); this.toggleCollapse(); }
  }
}