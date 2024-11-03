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
  ) {
    // Intentar cargar posts al iniciar el servicio
    this.fetchPosts().then(() => {
      console.log('Posts iniciales cargados');
    }).catch(error => {
      console.error('Error cargando posts iniciales:', error);
    });
  }

  async fetchPosts(): Promise<Post[]> {
    try {
      console.log('Obteniendo posts desde:', this.apiUrl + '/posts');
      const response = await lastValueFrom(
        this.http.get<any[]>(this.apiUrl + '/posts').pipe(
          retry(3),
          catchError(error => {
            console.error('Error fetching posts:', error);
            throw error;
          })
        )
      );

      const posts = response.map(item => Post.getNewPost(
        item.id,
        item.title,
        item.body,
        item.author,
        item.date || new Date().toISOString()
      ));

      this.postList.next(posts);
      return posts;
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

      // Obtener el siguiente ID
      const posts = await this.fetchPosts();
      const nextId = posts.length > 0 
        ? (Math.max(...posts.map(p => parseInt(p.id))) + 1).toString()
        : '1';

      const postToCreate = {
        id: nextId,
        title: post.title,
        body: post.body,
        author: `${user.firstName} ${user.lastName}`,
        date: new Date().toISOString()
      };

      const response = await lastValueFrom(
        this.http.post<any>(this.apiUrl + '/posts', postToCreate, this.httpOptions)
          .pipe(retry(3))
      );
      
      const newPost = Post.getNewPost(
        response.id,
        response.title,
        response.body,
        response.author,
        response.date
      );

      await this.fetchPosts();
      return newPost;
    } catch (error) {
      showAlertError('Error al crear post', error);
      return null;
    }
  }

  async updatePost(post: Post): Promise<Post | null> {
    try {
      const response = await lastValueFrom(
        this.http.put<any>(`${this.apiUrl}/posts/${post.id}`, post, this.httpOptions)
          .pipe(retry(3))
      );
      
      const updatedPost = Post.getNewPost(
        response.id,
        response.title,
        response.body,
        response.author,
        response.date
      );

      await this.fetchPosts();
      return updatedPost;
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
      
      await lastValueFrom(
        this.http.delete(`${this.apiUrl}/posts/${id}`, this.httpOptions)
          .pipe(
            retry(1),
            catchError(error => {
              if (error.status === 404) {
                showToast('La publicación no existe o ya fue eliminada');
              }
              throw error;
            })
          )
      );
      
      await this.fetchPosts();
      return true;
    } catch (error) {
      showAlertError('Error al eliminar post', error);
      return false;
    }
  }
}