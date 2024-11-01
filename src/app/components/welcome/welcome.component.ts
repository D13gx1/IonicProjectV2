import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/services/auth.service';
import { IonButton } from "@ionic/angular/standalone";
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  standalone: true,
  imports: [IonButton, TranslateModule]
})
export class WelcomeComponent implements OnInit {

  user: User = new User();

  constructor(private auth: AuthService, private router: Router) { 
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
  
}
