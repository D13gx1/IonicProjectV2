import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dinosaur',
  templateUrl: './dinosaur.component.html',
  styleUrls: ['./dinosaur.component.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonIcon,
    CommonModule, 
    FormsModule,
    TranslateModule
  ]
})
export class DinosaurComponent implements OnDestroy {
  dino: any;
  private subscription: Subscription;

  constructor(private authService: AuthService) { 
    addIcons({
      checkmarkCircle
    });
    
    this.subscription = this.authService.qrCodeData.subscribe((qr) => {
      this.dino = qr ? JSON.parse(qr) : null;
    });
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Ya no limpiamos los datos aquí
  }
}