import { Injectable, signal } from '@angular/core';
import { User } from '../models';

const STORAGE_KEY = 'condo_finder_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(this.loadUser());
  user = this.userSignal.asReadonly();

  isLoggedIn(): boolean {
    return !!this.user();
  }

  login(email: string): void {
    const mockUser: User = {
      id: 'u1',
      fullName: 'เจ้าของประกาศตัวอย่าง',
      email,
      phone: '081-234-5678',
      role: 'Owner',
      listingsCount: 0
    };
    this.saveUser(mockUser);
  }

  register(data: { fullName: string; email: string; phone: string; role: User['role'] }): void {
    const mockUser: User = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      listingsCount: 0
    };
    this.saveUser(mockUser);
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  hasActivePackage(): boolean {
    return !!this.user()?.packageId;
  }

  selectPackage(packageId: string): void {
    const currentUser = this.user();
    if (!currentUser) {
      return;
    }
    this.saveUser({ ...currentUser, packageId });
  }

  incrementListingsCount(): void {
    const currentUser = this.user();
    if (!currentUser) {
      return;
    }
    this.saveUser({ ...currentUser, listingsCount: currentUser.listingsCount + 1 });
  }

  private saveUser(user: User): void {
    this.userSignal.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private loadUser(): User | null {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  }
}
