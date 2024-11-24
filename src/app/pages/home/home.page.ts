import { Component, ViewChild } from '@angular/core';
import { DinosaurComponent } from 'src/app/components/dinosaur/dinosaur.component';
import { AuthService } from 'src/app/services/auth.service';
import { IonContent } from '@ionic/angular/standalone'
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { QrWebScannerComponent } from 'src/app/components/qr-web-scanner/qr-web-scanner.component';
import { Dinosaur } from 'src/app/model/dinosaur';
import { Capacitor } from '@capacitor/core';
import { ScannerService } from 'src/app/services/scanner.service';
import { WelcomeComponent } from 'src/app/components/welcome/welcome.component';
import { ForumComponent } from 'src/app/components/forum/forum.component';
import { MisDatosComponent } from 'src/app/components/mis-datos/mis-datos.component';
import { UsuariosComponent } from 'src/app/components/usuarios/usuarios.component';
import { showToast } from 'src/app/tools/message-functions';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, IonContent,
    HeaderComponent, FooterComponent,
    WelcomeComponent, QrWebScannerComponent, DinosaurComponent,
    ForumComponent, MisDatosComponent, UsuariosComponent
  ]
})
export class HomePage {
  @ViewChild(FooterComponent) footer!: FooterComponent;
  selectedComponent = 'welcome';
  isAdmin = false;

  constructor(private auth: AuthService, private scanner: ScannerService) {
    this.auth.authUser.subscribe(user => {
      this.isAdmin = user?.userName === 'admin';
    });
  }

  ionViewWillEnter() {
    // Verificar si es admin y establecer la vista inicial correspondiente
    if (this.isAdmin) {
      this.changeComponent('forum');
    } else {
      this.changeComponent('welcome');
    }
  }

  async headerClick(button: string) {
    if (this.isAdmin && !['forum', 'mis-datos', 'usuarios'].includes(button)) {
      return; // Simplemente retornamos sin mostrar mensaje
    }

    if (button === 'testqr')
      this.showDinoComponent(Dinosaur.jsonDinoExample);

    if (button === 'scan' && Capacitor.getPlatform() === 'web')
      this.selectedComponent = 'qrwebscanner';

    if (button === 'scan' && Capacitor.getPlatform() !== 'web')
      this.showDinoComponent(await this.scanner.scan());
  }

  webQrScanned(qr: string) {
    this.showDinoComponent(qr);
  }

  webQrStopped() {
    if (this.isAdmin) {
      this.changeComponent('forum');
    } else {
      this.changeComponent('welcome');
    }
  }

  showDinoComponent(qr: string) {
    if (Dinosaur.isValidDinosaurQrCode(qr)) {
      this.auth.qrCodeData.next(qr);
      if (!this.isAdmin) {
        this.selectedComponent = 'mi-clase';
        this.footer.selectedButton = 'mi-clase';
      }
      return;
    }
    if (this.isAdmin) {
      this.changeComponent('forum');
    } else {
      this.changeComponent('welcome');
    }
  }

  footerClick(button: string) {
    if (this.isAdmin && !['forum', 'mis-datos', 'usuarios'].includes(button)) {
      return; // Simplemente retornamos sin mostrar mensaje
    }
    this.selectedComponent = button;
  }

  changeComponent(name: string) {
    if (this.isAdmin && !['forum', 'mis-datos', 'usuarios'].includes(name)) {
      // En lugar de mostrar mensaje, redirigimos al foro
      name = 'forum';
    }
    this.selectedComponent = name;
    this.footer.selectedButton = name;
  }
}