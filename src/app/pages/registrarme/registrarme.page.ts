import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { User } from 'src/app/model/user';
import { EducationalLevel } from 'src/app/model/educational-level';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonIcon, IonButtons, IonToolbar, IonHeader, IonTitle } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { convertStringToDate } from 'src/app/tools/date-functions';
import { showToast } from 'src/app/tools/message-functions';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrarme',
  templateUrl: './registrarme.page.html',
  styleUrls: ['./registrarme.page.scss'],
  standalone: true,
  imports: [IonTitle, IonHeader, IonToolbar, IonButtons, IonIcon, 
    CommonModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class RegistrarmePage {
  userForm: FormGroup;
  educationalLevels: EducationalLevel[] = EducationalLevel.getLevels();

  constructor(
    private fb: FormBuilder, 
    private databaseService: DatabaseService,
    private authService: AuthService,
    private router: Router
  ){
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

        // Crear nuevo usuario
        const newUser = User.getNewUsuario(
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
        await this.databaseService.saveUser(newUser);
        
        // Realizar login automático
        const loginSuccess = await this.authService.login(
          formValues.userName,  // Usando userName en lugar de email
          formValues.password
        );

        if (loginSuccess) {
          showToast('Usuario registrado correctamente');
          await this.router.navigate(['/home']);
        } else {
          showToast('Error al iniciar sesión automáticamente');
        }
        
      } catch (error) {
        console.error('Error al registrar:', error);
        showToast('Error al registrar el usuario');
      }
    } else {
      showToast('Por favor, completa todos los campos correctamente');
    }
  }
}