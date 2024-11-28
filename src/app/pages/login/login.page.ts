import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewWillEnter } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageComponent } from 'src/app/components/language/language.component';
import { Router } from '@angular/router';
import { colorWandOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth.service';
import { showAlertError } from 'src/app/tools/message-functions'; // Asegúrate de importar esto para los mensajes de error

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    LanguageComponent
  ]
})
export class LoginPage implements ViewWillEnter {

  @ViewChild('selectLanguage') selectLanguage!: LanguageComponent;

  correo: string;
  password: string;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private authService: AuthService
  ) { 
    this.correo = '';
    this.password = '';
    addIcons({ colorWandOutline }); 
  }

  async ionViewWillEnter() {
    // Limpiar credenciales al entrar
    this.correo = '';
    this.password = '';
    this.selectLanguage.setCurrentLanguage();
  }

  navigateTheme() {
    this.router.navigate(['/theme']);
  }

  async login() {
    if (!this.correo || !this.password) {
      showAlertError('login.page.ts', 'Por favor, ingresa un correo y una contraseña válidos.');
      return;
    }
    await this.authService.login(this.correo, this.password);
      
  }

  registerNewUser() {
    this.router.navigate(['/registrarme']);
  }

  passwordRecovery() {
    this.router.navigate(['/recuperar']);
  }

  goRute() {
    this.router.navigate(['/map']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
