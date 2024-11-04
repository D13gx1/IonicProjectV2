import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { IonButton, IonToolbar, IonHeader, IonCardContent, IonCardHeader, IonCardTitle, IonCard, IonIcon, IonContent, IonButtons, IonTitle } from "@ionic/angular/standalone";
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import jsQR from 'jsqr';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: true,
  imports: [IonTitle, IonButtons, IonContent, IonIcon, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonHeader, IonToolbar, IonButton, TranslateModule]
})
export class WelcomeComponent implements OnInit {
  
  
  user: User = new User();
  
  @ViewChild('fileinput', { static: false }) private fileinput!: ElementRef;
  @ViewChild('video', { static: false }) private video!: ElementRef;
  @ViewChild('canvas', { static: false }) private canvas!: ElementRef;

  public escaneando = false;
  public datosQR = '';
  public loading: HTMLIonLoadingElement | null = null;

  // Variables para almacenar los datos del QR
  public sede: string | undefined;
  public idAsignatura: string | undefined;
  public seccion: string | undefined;
  public nombreAsignatura: string | undefined;
  public nombreProfesor: string | undefined;
  public dia: string | undefined;
  public horaInicio: string | undefined;
  public horaFin: string | undefined;
  public bloqueInicio: number | undefined;
  public bloqueTermino: number | undefined;

  constructor(private auth: AuthService, private router: Router, private loadingController: LoadingController, 
    private alertController: AlertController,  ) { 
    this.auth.authUser.subscribe((user) => {
      console.log(user);
      if (user) {
        this.user = user;
      }
    });
  }

  ngOnInit() {}


  cerrarSesion() {
    // Lógica para cerrar sesión
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }
  

  // Verifica continuamente el video hasta que detecte un código QR


  // Extrae los datos del código QR usando jsQR


  // Ordena los datos del QR y los redirige a la página Mi Curso


  // Muestra una alerta de confirmación para cerrar sesión
  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar salida',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Salir',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  // Lógica de cierre de sesión
  logout() {
    this.router.navigate(['/login']);
  }
}
