import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { APIClientService } from 'src/app/services/apiclient.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, IonFabButton, IonFab, IonList, IonCardContent, IonHeader
  , IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle
  , IonCardSubtitle, IonItem, IonLabel, IonInput, IonTextarea
  , IonGrid, IonRow, IonCol, IonButton, IonIcon, IonContent
  , IonFabList } from '@ionic/angular/standalone';
import { pencilOutline, trashOutline, add } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from 'src/app/model/post';
import { showToast, showAlertError } from 'src/app/tools/message-functions';
import { addIcons } from 'ionicons';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss'],
  standalone: true,
  imports: [IonList, IonHeader, IonToolbar, IonTitle, IonCard
    , IonCardHeader, IonCardTitle, IonCardSubtitle, IonItem
    , IonLabel, IonInput, IonTextarea, IonGrid, IonRow, IonCol
    , IonButton, IonIcon, IonContent, IonCardContent
    , IonFab, IonFabButton, IonFabList
    , CommonModule, FormsModule]
})
export class ForumComponent implements OnInit, OnDestroy {
  post: Post = new Post();
  posts: Post[] = [];
  selectedPostText = 'Nueva publicación';
  intervalId: any = null;
  user = new User();
  private postsSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(
    private api: APIClientService, 
    private auth: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ pencilOutline, trashOutline, add });
  }

  async ngOnInit() {
    try {
      // Primero cargar los posts existentes
      await this.loadPosts();

      // Luego suscribirse a los cambios
      this.postsSubscription = this.api.postList.subscribe(posts => {
        console.log('Posts actualizados:', posts);
        this.posts = posts.sort((a, b) => {
          const idA = parseInt(a.id);
          const idB = parseInt(b.id);
          return idA - idB;
        });
      });

      this.userSubscription = this.auth.authUser.subscribe(user => {
        this.user = user || new User();
      });
    } catch (error) {
      console.error('Error cargando posts:', error);
      showAlertError('Error al cargar las publicaciones', error);
    }
  }

  ngOnDestroy() {
    if (this.postsSubscription) this.postsSubscription.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  async loadPosts() {
    try {
      const posts = await this.api.fetchPosts();
      console.log('Posts cargados:', posts);
    } catch (error) {
      console.error('Error en loadPosts:', error);
      showAlertError('Error al cargar las publicaciones', error);
    }
  }

  cleanPost() {
    this.post = new Post();
    this.selectedPostText = 'Nueva publicación';
  }

  async savePost() {
    try {
      if (!this.post.title.trim()) {
        showToast('Por favor, completa el título.');
        return;
      }
      if (!this.post.body.trim()) {
        showToast('Por favor, completa el cuerpo.');
        return;
      }

      if (this.post.id) {
        await this.updatePost();
      } else {
        await this.createPost();
      }
    } catch (error) {
      showAlertError('Error al guardar la publicación', error);
    }
  }

  private async createPost() {
    try {
      this.post.author = `${this.user.firstName} ${this.user.lastName}`;
      const createdPost = await this.api.createPost(this.post);
      if (createdPost) {
        showToast(`Publicación creada correctamente: ${createdPost.title}`);
        this.cleanPost();
        await this.loadPosts();
      }
    } catch (error) {
      showAlertError('Error al crear la publicación', error);
    }
  }

  private async updatePost() {
    try {
      this.post.author = `${this.user.firstName} ${this.user.lastName}`;
      const updatedPost = await this.api.updatePost(this.post);
      if (updatedPost) {
        showToast(`Publicación actualizada correctamente: ${updatedPost.title}`);
        this.cleanPost();
        await this.loadPosts();
      }
    } catch (error) {
      showAlertError('Error al actualizar la publicación', error);
    }
  }

  editPost(post: Post) {
    this.post = { ...post };
    this.selectedPostText = `Editando publicación #${post.id}`;
    document.getElementById('topOfPage')?.scrollIntoView({ behavior: 'smooth' });
  }

  async deletePost(post: Post) {
    try {
      if (!post?.id) {
        showToast('No se puede identificar la publicación a eliminar');
        return;
      }

      console.log('Intentando eliminar post:', post);

      const alert = await this.alertController.create({
        header: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar esta publicación?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: async () => {
              try {
                const success = await this.api.deletePost(post.id);
                if (success) {
                  showToast('Publicación eliminada correctamente');
                  await this.loadPosts();
                }
              } catch (error) {
                showAlertError('Error al eliminar la publicación', error);
              }
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      showAlertError('Error al procesar la eliminación', error);
    }
  }

  getPostId(index: number, post: Post): string {
    return post.id;
  }
}