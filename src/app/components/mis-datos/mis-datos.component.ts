import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { User } from 'src/app/model/user';
import { EducationalLevel } from 'src/app/model/educational-level';
import { IonContent, IonItem, IonLabel, IonDatetime,IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: true,
  imports: [
    IonContent,          // Importa directivas comunes de Angular como *ngIf y *ngFor
    IonItem,           // Importa IonicModule para usar componentes de Ionic
    IonLabel,
    IonDatetime,
    IonInput,
    IonButton,    // Importa ReactiveFormsModule para el manejo de formularios reactivos
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule
      
  ]
})
export class MisDatosComponent implements OnInit {
  userForm: FormGroup;
  currentUser!: User;
  educationalLevels: EducationalLevel[] = EducationalLevel.getLevels(); // Para listar los niveles educativos

  constructor(
    private fb: FormBuilder, 
    private databaseService: DatabaseService
  ) {
    // Inicializa el formulario con campos vacíos
    this.userForm = this.fb.group({
      userName: [''],
      email: [''],
      password: [''],
      secretQuestion: [''],
      secretAnswer: [''],
      firstName: [''],
      lastName: [''],
      educationalLevel: [''],
      dateOfBirth: [''],
      address: [''],
      image: [''],
    });
  }

  async ngOnInit() {
    // Carga los datos del usuario al iniciar el componente
    this.currentUser = await this.databaseService.readUser('atorres') ?? new User();
    this.loadUserData();
  }

  loadUserData() {
    this.userForm.patchValue(this.currentUser);
  }

  async onSave() {
    if (this.userForm.valid) {
      const updatedUser = { ...this.currentUser, ...this.userForm.value };
      await this.databaseService.saveUser(updatedUser);
      alert("Datos actualizados correctamente.");
    }
  }
}
