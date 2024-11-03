import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Post } from '../model/post';
import { showAlertError, showToast } from '../tools/message-functions';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class APIClientService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  apiUrl = 'http://localhost:3005';
  postList: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private async refreshPostList(): Promise<void> {
    try {
      const posts = await this.fetchPosts();
      this.postList.next(posts);
    } catch (error) {
      showAlertError('Error al refrescar la lista de posts', error);
    }
  }

  async fetchPosts(): Promise<Post[]> {
    try {
      console.log('Obteniendo posts desde:', this.apiUrl + '/posts');
      const response = await lastValueFrom(
        this.http.get<any[]>(this.apiUrl + '/posts').pipe(
          retry(3),
          catchError(error => {
            if (error.status === 0) {
              showToast('Error de conexión: Verifica que el servidor JSON esté corriendo en puerto 3005');
            }
            throw error;
          })
        )
      );

      return response.map(item => Post.getNewPost(
        item.id.toString(),
        item.title,
        item.body,
        item.author || `Usuario ${item.userId}`,
        new Date().toISOString(),
        ''
      ));
    } catch (error) {
      console.error('Error en fetchPosts:', error);
      return [];
    }
  }

  async createPost(post: Post): Promise<Post | null> {
    try {
      const user = await this.authService.readAuthUser();
      if (!user) {
        showToast('Debe iniciar sesión para crear publicaciones');
        return null;
      }

      const postToCreate = {
        title: post.title,
        body: post.body,
        author: `${user.firstName} ${user.lastName}`,
        date: new Date().toISOString(),
        userId: 1 // Valor por defecto
      };

      const response = await lastValueFrom(
        this.http.post<any>(this.apiUrl + '/posts', postToCreate, this.httpOptions)
          .pipe(retry(3))
      );
      
      await this.refreshPostList();
      return Post.getNewPost(
        response.id.toString(),
        response.title,
        response.body,
        response.author,
        response.date,
        ''
      );
    } catch (error) {
      showAlertError('Error al crear post', error);
      return null;
    }
  }

  async updatePost(post: Post): Promise<Post | null> {
    try {
      const response = await lastValueFrom(
        this.http.put<any>(`${this.apiUrl}/posts/${post.id}`, {
          id: post.id,
          title: post.title,
          body: post.body,
          author: post.author,
          date: post.date,
          userId: 1 // Valor por defecto
        }, this.httpOptions)
          .pipe(retry(3))
      );
      
      await this.refreshPostList();
      return Post.getNewPost(
        response.id.toString(),
        response.title,
        response.body,
        response.author,
        response.date,
        ''
      );
    } catch (error) {
      showAlertError('Error al actualizar post', error);
      return null;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      if (!id) {
        showToast('ID de publicación no válido');
        return false;
      }

      console.log('Intentando eliminar post con ID:', id);

      // Verificar si el post existe
      const posts = await this.fetchPosts();
      const postExists = posts.some(post => post.id === id);
      
      if (!postExists) {
        showToast('La publicación no existe o ya fue eliminada');
        return false;
      }

      await lastValueFrom(
        this.http.delete(`${this.apiUrl}/posts/${id}`, this.httpOptions)
          .pipe(
            retry(1),
            catchError(error => {
              if (error.status === 404) {
                showToast('La publicación no existe o ya fue eliminada');
              } else {
                showAlertError('Error al eliminar la publicación', error);
              }
              throw error;
            })
          )
      );
      
      await this.refreshPostList();
      showToast('Publicación eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar post:', error);
      return false;
    }
  }
}