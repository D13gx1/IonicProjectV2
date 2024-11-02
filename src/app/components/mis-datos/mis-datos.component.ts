import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { User } from 'src/app/model/user';
import { EducationalLevel } from 'src/app/model/educational-level';
import { IonContent, IonItem, IonLabel, IonDatetime,IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common'; // Añade esta importación

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,      // Añade CommonModule aquí
    IonContent,
    IonItem,
    IonLabel,
    IonDatetime,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule
  ]
})
export class MisDatosComponent implements OnInit {
  userForm: FormGroup;
  currentUser!: User;
  educationalLevels: EducationalLevel[] = EducationalLevel.getLevels();

  constructor(
    private fb: FormBuilder, 
    private databaseService: DatabaseService
  ) {
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
    this.currentUser = await this.databaseService.readUser('atorres') ?? new User();
    this.loadUserData();
    console.log('Niveles educativos:', this.educationalLevels); // Para debug
  }

  loadUserData() {
    this.userForm.patchValue(this.currentUser);
    console.log('Datos cargados:', this.currentUser); // Para debug
  }

  async onSave() {
    if (this.userForm.valid) {
      const updatedUser = { ...this.currentUser, ...this.userForm.value };
      await this.databaseService.saveUser(updatedUser);
      alert("Datos actualizados correctamente.");
    }
  }
}