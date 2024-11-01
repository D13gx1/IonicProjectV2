import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, NavController, IonCardContent, IonCard, IonItem, IonCardHeader, IonCardTitle, IonCardSubtitle, IonToast, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { DatabaseService } from '../../services/database.service';
import { User } from '../../model/user';
import { Router } from '@angular/router';

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
    IonToast
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


  ngOnInit() { }

  async verificarCorreo() {
    if (!this.email) {
        this.presentToast('Por favor, ingresa un correo electrónico.');
        return;
    }

    try {
        this.user = await this.dbService.findUserByEmail(this.email);
        console.log('Usuario encontrado:', this.user);
        if (this.user) {
            this.secretQuestion = this.user.secretQuestion;
            this.showSecretQuestion = true;
            this.showEmailInput = false;
        } else {
            console.log('Redirigiendo a incorrecto...');
            this.presentToast('El correo no se encontró.');
            this.router.navigate(['/incorrecto']);
        }
    } catch (error) {
        console.error('Error al buscar el usuario:', error);
        this.presentToast('Hubo un error al buscar el usuario.');
    }
}


async verificarRespuesta() {
  if (!this.user) {
      this.presentToast('No se ha encontrado un usuario. Verifica tu correo primero.');
      return;
  }

  if (this.answer === this.user.secretAnswer) {
      // Si la respuesta es correcta, redirigimos a la página correcto
      this.router.navigate(['/correcto'], {
          state: {
              user: this.user // Pasamos el usuario a la página correcto
          }
      });
  } else {
      this.presentToast('La respuesta secreta es incorrecta. Inténtalo de nuevo.');
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
