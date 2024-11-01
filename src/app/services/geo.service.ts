import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { showAlertError } from '../tools/message-functions';

@Injectable({
  providedIn: 'root',
})
export class GeoService {

  private readonly apiUrl = 'https://nominatim.openstreetmap.org';

  constructor(private platform: Platform, private http: HttpClient) {}

  async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    try {
      if (this.platform.is('capacitor')) {
        const { coords } = await Geolocation.getCurrentPosition({ 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        });
        return { lat: coords.latitude, lng: coords.longitude };

      } else if (this.platform.is('desktop') || this.platform.is('pwa')) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              resolve({ lat: latitude, lng: longitude });
            },
            (error) => {
              // Manejo de error específico para geolocalización
              const errorMessage = this.getErrorMessage(error);
              showAlertError('getCurrentPosition', errorMessage);
              reject(error);
            }
          );
        });
      }

      showAlertError('GeolocationService.getCurrentPosition', 'Plataforma no soportada para obtener la posición');
      return null;

    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      showAlertError('GeolocationService.getCurrentPosition', errorMessage);
      return null;
    }
  }

  // Obtener la ubicación a partir de coordenadas, con manejo de errores
  getPlaceFromCoordinates(lat: number, lng: number): Observable<any> {
    const url = `${this.apiUrl}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    return this.http.get(url).pipe(
      catchError(error => {
        const errorMessage = this.getErrorMessage(error);
        showAlertError('getPlaceFromCoordinates', errorMessage);
        return of(null); // Retorna un Observable que emite `null` en caso de error
      })
    );
  }

  // Función para obtener el mensaje de error
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message || 'Error desconocido';
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      return (error as { message: string }).message || 'Error desconocido';
    }
    return 'Error desconocido';
  }
}
