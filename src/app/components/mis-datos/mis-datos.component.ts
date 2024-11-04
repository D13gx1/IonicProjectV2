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
    private authService: AuthService  // Inyecta AuthService aquí
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
      dateOfBirth: ['', [Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]],
      address: [''],
      image: ['']
    });
  }

  async ngOnInit() {
    const currentUserID = this.authService.getCurrentUserId();
    if (currentUserID) {
      this.currentUser = await this.databaseService.readUser(currentUserID) ?? new User();
      this.loadUserData();
    } else {
      showToast('Error: No se encontró un usuario autenticado');
    }
  }

  loadUserData() {
    const formData = {
      ...this.currentUser,
      dateOfBirth: this.currentUser.dateOfBirth instanceof Date 
        ? convertDateToString(this.currentUser.dateOfBirth)
        : ''
    };
    this.userForm.patchValue(formData);
  }

  onDateInput(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Solo permitir números
    if (value.length > 0) {
      // Formatear como dd/mm/yyyy
      if (value.length > 4) {
        value = value.slice(0, 8); // Limitar a 8 dígitos
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

        const dateOfBirth = convertStringToDate(formValues.dateOfBirth);
        
        const updatedUser = {
          ...this.currentUser,
          ...formValues,
          dateOfBirth
        };

        await this.databaseService.saveUser(updatedUser);
        showToast('Datos actualizados correctamente');
      } catch (error) {
        console.error('Error al guardar:', error);
        showToast('Error al actualizar los datos. Verifica el formato de la fecha (dd/mm/yyyy)');
      }
    } else {
      showToast('Por favor, verifica los datos ingresados');
    }
  }
}
