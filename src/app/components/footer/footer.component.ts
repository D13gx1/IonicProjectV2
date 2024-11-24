import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, bookOutline, pencilOutline, qrCodeOutline, personOutline, peopleOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonIcon
  ]
})
export class FooterComponent {
  selectedButton = 'welcome';
  @Output() footerClick = new EventEmitter<string>();
  isAdmin = false;

  constructor() { 
    addIcons({ homeOutline, qrCodeOutline, bookOutline, pencilOutline, personOutline, peopleOutline });
    inject(AuthService).authUser.subscribe(user => {
      this.isAdmin = user?.userName === 'admin';
    });
  }

  sendClickEvent($event: any) {
    this.footerClick.emit(this.selectedButton);
  }
}