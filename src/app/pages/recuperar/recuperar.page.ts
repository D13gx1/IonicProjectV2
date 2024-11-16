import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, NavController, IonCardContent, IonCard, IonItem, IonCardHeader, IonCardTitle, IonCardSubtitle, IonToast, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database.service';
import { User } from '../../model/user';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons, 
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonButton,
    IonInput,
    IonToast,
    TranslateModule
  ]
})
export class RecuperarPage implements OnInit {
  email: string = '';
  user: User | undefined; // Almacenar el usuario encontrado
  secretQuestion: string = '';
  userName: string = '';
  userLastName: string = '';
  answer: string = '';
  showSecretQuestion: boolean = false;
  showEmailInput: boolean = true;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(private dbService: DatabaseService, private navCtrl: NavController, private router: Router) { }


  ngOnInit() {
    this.resetForm();
   }

   ionViewWillEnter() {
    this.resetForm();
  }

  private resetForm() {
    this.email = '';
    this.user = undefined;
    this.secretQuestion = '';
    this.userName = '';
    this.userLastName = '';
    this.answer = '';
    this.showSecretQuestion = false;
    this.showEmailInput = true;
    this.showToast = false;
    this.toastMessage = '';
  }

  async verificarCorreo() {
    if (!this.email) {
      this.presentToast('Por favor, ingresa un correo electrónico.');
      return;
    }
  
    // Validación de formato de correo
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.presentToast('Por favor, ingresa un correo electrónico válido.');
      return;
    }
  
    try {
      const user: User | undefined = await this.dbService.findUserByEmail(this.email);
      
      // Verifica si el usuario se encontró
      if (user) {
        // Usuario encontrado: carga sus datos
        this.user = user;
        this.secretQuestion = user.secretQuestion;
        this.userName = user.firstName;
        this.userLastName = user.lastName;
        this.showSecretQuestion = true;
        this.showEmailInput = false;
      } else {
        // Usuario no encontrado: redirige a la página incorrecto
        this.router.navigate(['/incorrecto']);
      }
    } catch (error) {
      console.error('Error al buscar el usuario:', error);
      this.presentToast('Hubo un error al buscar el usuario.');
      this.showSecretQuestion = false; // Mantén el input de correo visible
      this.showEmailInput = true;
    }
  }

  


async verificarRespuesta() {
  if (!this.user) {
    this.presentToast('No se ha encontrado un usuario. Verifica tu correo primero.');
    return;
  }

  if (!this.answer || this.answer.trim() === '') {
    // Validación si el campo de respuesta está vacío
    this.presentToast('Por favor, escribe una respuesta.');
    return;
  }

  if (this.answer === this.user.secretAnswer) {
    // Si la respuesta es correcta, redirige a la página correcto
    this.router.navigate(['/correcto'], {
      state: {
        user: this.user // Pasamos el usuario a la página correcto
      }
    });
  } else {
    // Si la respuesta es incorrecta, redirige a la página incorrecto
    this.router.navigate(['/incorrecto']);
  }
}


  presentToast(message: string) {
    this.toastMessage = message;
    this.showToast = true; // Mostrar el toast
  }

  irALogin() {
    this.router.navigate(['/login']); // Reemplaza '/login' con la ruta correcta
  }
}
