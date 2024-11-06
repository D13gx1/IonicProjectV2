import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { User } from 'src/app/model/user';
import { EducationalLevel } from 'src/app/model/educational-level';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { convertDateToString, convertStringToDate } from 'src/app/tools/date-functions';
import { showToast } from 'src/app/tools/message-functions';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.component.html',
  styleUrls: ['./mis-datos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonItem,
    IonLabel,
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
    private databaseService: DatabaseService,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      secretQuestion: ['', Validators.required],
      secretAnswer: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      educationalLevel: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]],
      address: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      const currentUserID = await this.authService.getCurrentUserId();
      if (currentUserID) {
        const user = await this.databaseService.readUser(currentUserID);
        if (user) {
          this.currentUser = user;
          this.loadUserData();
        } else {
          showToast('Error: Usuario no encontrado');
        }
      } else {
        showToast('Error: No hay usuario autenticado');
      }
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      showToast('Error al cargar los datos del usuario');
    }
  }

  loadUserData() {
    if (this.currentUser) {
      const formData = {
        userName: this.currentUser.userName,
        email: this.currentUser.email,
        password: this.currentUser.password,
        secretQuestion: this.currentUser.secretQuestion,
        secretAnswer: this.currentUser.secretAnswer,
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        educationalLevel: this.currentUser.educationalLevel?.id,
        dateOfBirth: this.currentUser.dateOfBirth instanceof Date 
          ? convertDateToString(this.currentUser.dateOfBirth)
          : '',
        address: this.currentUser.address,
        image: this.currentUser.image
      };
      this.userForm.patchValue(formData);
    }
  }

  onDateInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length > 4) {
        value = value.slice(0, 8);
        value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{2})/, '$1/$2/');
      } else {
        value = value.replace(/(\d{2})/, '$1/');
      }
    }
    this.userForm.patchValue({ dateOfBirth: value });
  }

  async onSave() {
    if (this.userForm.valid) {
      try {
        const formValues = this.userForm.value;
        
        if (!formValues.dateOfBirth.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          showToast('El formato de fecha debe ser dd/mm/yyyy');
          return;
        }

        // Convertir fecha
        const dateOfBirth = convertStringToDate(formValues.dateOfBirth);
        
        // Obtener objeto EducationalLevel
        const educationalLevel = EducationalLevel.findLevel(formValues.educationalLevel);
        if (!educationalLevel) {
          showToast('Error: Nivel educacional inválido');
          return;
        }

        // Crear usuario actualizado
        const updatedUser = User.getNewUsuario(
          formValues.userName,
          formValues.email,
          formValues.password,
          formValues.secretQuestion,
          formValues.secretAnswer,
          formValues.firstName,
          formValues.lastName,
          educationalLevel,
          dateOfBirth,
          formValues.address,
          formValues.image
        );

        // Guardar en base de datos
        await this.databaseService.saveUser(updatedUser);
        
        // Actualizar usuario autenticado
        await this.authService.saveAuthUser(updatedUser);
        
        showToast('Datos actualizados correctamente');
      } catch (error) {
        console.error('Error al guardar:', error);
        showToast('Error al actualizar los datos');
      }
    } else {
      showToast('Por favor, completa todos los campos correctamente');
    }
  }
}