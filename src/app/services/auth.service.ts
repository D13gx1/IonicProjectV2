import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { showAlertError, showToast } from 'src/app/tools/message-functions';
import { User } from '../model/user';
import { Storage } from '@ionic/storage-angular';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  storageAuthUserKey = 'AUTHENTICATED_USER';
  authUser = new BehaviorSubject<User | null>(null);
  isFirstLogin = new BehaviorSubject<boolean>(false);
  storageQrCodeKey = 'QR_CODE';
  qrCodeData = new BehaviorSubject<string | null>(null);

  constructor(private router: Router, private db: DatabaseService, private storage: Storage) { }

  async initializeAuthService() {
    try {
      await this.storage.create();
    } catch (error) {
      showAlertError('AuthService.initializeAuthService', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.readAuthUser();
      return user !== null;
    } catch (error) {
      showAlertError('AuthService.isAuthenticated', error);
      return false;
    }
  }

  async readAuthUser(): Promise<User | null> {
    try {
      const user = (await this.storage.get(this.storageAuthUserKey)) as User | null;
      this.authUser.next(user ?? null);
      return user;
    } catch (error) {
      showAlertError('AuthService.readAuthUser', error);
      return null;
    }
  }

  async saveAuthUser(user: User): Promise<User | null> {
    try {
      await this.storage.set(this.storageAuthUserKey, user);
      this.authUser.next(user);
      return user;
    } catch (error) {
      showAlertError('AuthService.saveAuthUser', error);
      return null;
    }
  }

  async deleteAuthUser(): Promise<boolean> {
    try {
      await this.storage.remove(this.storageAuthUserKey);
      this.authUser.next(null);
      return true;
    } catch (error) {
      showAlertError('AuthService.deleteAuthUser', error);
      return false;
    }
  }

  async login(userName: string, password: string): Promise<boolean> {
    try {
      // Limpiar sesión anterior
      await this.deleteAuthUser();
      await this.storage.remove(this.storageQrCodeKey);
      
      // Buscar usuario en BD
      const dbUser = await this.db.findUser(userName, password);
      
      // Si no existe el usuario
      if (!dbUser) {
        showToast('El usuario no existe o las credenciales son incorrectas');
        return false;
      }

      // Validación adicional de campos requeridos
      if (!dbUser.userName || !dbUser.email || !dbUser.firstName || !dbUser.lastName) {
        showToast('Error en los datos del usuario');
        return false;
      }

      // Guardar usuario autenticado
      await this.saveAuthUser(dbUser);
      this.authUser.next(dbUser);
      this.isFirstLogin.next(true);
      
      // Mostrar mensaje de bienvenida y navegar al home
      showToast(`¡Bienvenid@ ${dbUser.firstName} ${dbUser.lastName}!`);
      await this.router.navigate(['/home'], { replaceUrl: true });
      return true;

    } catch (error) {
      // En caso de cualquier error en la autenticación
      showAlertError('AuthService.login', error);
      await this.router.navigate(['/login']);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const user = await this.readAuthUser();

      if (user) {
        showToast(`¡Hasta pronto ${user.firstName} ${user.lastName}!`);
        await this.deleteAuthUser();
        // Limpiar datos del QR al cerrar sesión
        this.qrCodeData.next(null);
        await this.storage.remove(this.storageQrCodeKey);
      }

      await this.router.navigate(['/login'], { replaceUrl: true });
      return true;
    } catch (error) {
      showAlertError('AuthService.logout', error);
      return false;
    }
  }

  getCurrentUserId(): string | null {
    return this.authUser.value ? this.authUser.value.userName : null;
  }
}
