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
  
  async comenzarEscaneoQR() {
    try {
      const mediaProvider = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      this.video.nativeElement.srcObject = mediaProvider;
      this.video.nativeElement.setAttribute('playsinline', 'true');
      this.loading = await this.loadingController.create({});
      await this.loading.present();
      this.video.nativeElement.play();
      requestAnimationFrame(this.verificarVideo.bind(this));
    } catch (err) {
      console.error('Error al inicializar la cámara: ', err);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo iniciar la cámara. Por favor, revisa los permisos o el estado de tu dispositivo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  // Verifica continuamente el video hasta que detecte un código QR
  async verificarVideo() {
    if (this.video.nativeElement.readyState === this.video.nativeElement.HAVE_ENOUGH_DATA) {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
        this.escaneando = true;
      }

      if (this.obtenerDatosQr()) {
        console.log('datos obtenidos');
      } else {
        if (this.escaneando) {
          console.log('escaneando...');
          requestAnimationFrame(this.verificarVideo.bind(this));
        }
      }
    } else {
      console.log('video aún no tiene datos');
      requestAnimationFrame(this.verificarVideo.bind(this));
    }
  }

  // Extrae los datos del código QR usando jsQR
  public obtenerDatosQr(source?: CanvasImageSource): boolean {
    let w = 0;
    let h = 0;

    if (!source) {
      this.canvas.nativeElement.width = this.video.nativeElement.videoWidth;
      this.canvas.nativeElement.height = this.video.nativeElement.videoHeight;
    }

    w = this.canvas.nativeElement.width;
    h = this.canvas.nativeElement.height;

    const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    context.drawImage(source ? source : this.video.nativeElement, 0, 0, w, h);
    const img: ImageData = context.getImageData(0, 0, w, h);
    const qrCode = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });

    if (qrCode) {
      this.escaneando = false;
      this.datosQR = qrCode.data;
      this.mostrarDatosQROrdenados(this.datosQR);
    }

    return this.datosQR !== '';
  }

  // Ordena los datos del QR y los redirige a la página Mi Curso
  public mostrarDatosQROrdenados(datosQR: string): void {
    try {
      const objetoDatosQR = JSON.parse(datosQR);
      this.sede = objetoDatosQR.sede;
      this.idAsignatura = objetoDatosQR.idAsignatura;
      this.seccion = objetoDatosQR.seccion;
      this.nombreAsignatura = objetoDatosQR.nombreAsignatura;
      this.nombreProfesor = objetoDatosQR.nombreProfesor;
      this.dia = objetoDatosQR.dia;
      this.horaInicio = objetoDatosQR.horaInicio;
      this.horaFin = objetoDatosQR.horaFin;
      this.bloqueInicio = objetoDatosQR.bloqueInicio;
      this.bloqueTermino = objetoDatosQR.bloqueTermino;

      // Redirige a la página Mi Curso pasando los datos
      this.router.navigate(['/tabs/mi-curso'], {
        state: {
          sede: this.sede,
          idAsignatura: this.idAsignatura,
          seccion: this.seccion,
          nombreAsignatura: this.nombreAsignatura,
          nombreProfesor: this.nombreProfesor,
          dia: this.dia,
          horaInicio: this.horaInicio,
          horaFin: this.horaFin,
          bloqueInicio: this.bloqueInicio,
          bloqueTermino: this.bloqueTermino,
        }
      });
    } catch (error) {
      console.error('Error al procesar el código QR', error);
    }
  }

  // Permite cargar una imagen desde un archivo para escanear el código QR
  public cargarImagenDesdeArchivo(): void {
    this.fileinput.nativeElement.click();
  }

  // Verifica el archivo cargado y escanea el QR si existe
  public verificarArchivoConQr(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      const img = new Image();
      img.onload = () => {
        this.obtenerDatosQr(img);
      };
      img.src = URL.createObjectURL(file);
    }
  }

  // Detiene el escaneo de QR
  public detenerEscaneoQR(): void {
    this.escaneando = false;
  }

  // Limpia los datos y reinicia los valores
  public limpiarDatos(): void {
    this.escaneando = false;
    this.datosQR = '';
    this.loading = null;
    (document.getElementById('input-file') as HTMLInputElement).value = '';
  }

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
