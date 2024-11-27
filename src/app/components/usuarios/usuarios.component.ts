import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, AlertController, IonBadge, IonAvatar } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { DatabaseService } from 'src/app/services/database.service';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { showToast } from 'src/app/tools/message-functions';
import { addIcons } from 'ionicons';
import { trashOutline, peopleOutline, mailOutline, schoolOutline, calendarOutline, mapOutline, shieldOutline } from 'ionicons/icons';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBadge,
  ]
})
export class UsuariosComponent implements OnInit {
  users: User[] = [];

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ 
      trashOutline, 
      peopleOutline, 
      mailOutline, 
      schoolOutline, 
      calendarOutline, 
      mapOutline,
      shieldOutline
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.databaseService.userList.subscribe(users => {
      this.users = users;
    });
  }

  async loadUsers() {
    this.users = await this.databaseService.readUsers();
  }

  async confirmDelete(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar al usuario ${user.userName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => this.deleteUser(user)
        }
      ]
    });

    await alert.present();
  }

  async deleteUser(user: User) {
    if (user.userName === 'admin') {
      showToast('No se puede eliminar la cuenta de administrador');
      return;
    }

    const success = await this.databaseService.deleteByUserName(user.userName);
    if (success) {
      showToast('Usuario eliminado correctamente');
      await this.loadUsers();
    } else {
      showToast('Error al eliminar el usuario');
    }
  }
}