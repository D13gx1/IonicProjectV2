export class Post {
  id: string = '';
  title: string = '';
  body: string = '';
  author: string = '';
  date: string = '';
  authorImage: string = '';

  constructor() { }

  public static getNewPost(
    id: string = '',
    title: string = '',
    body: string = '',
    author: string = '',
    date: string = '',
    authorImage: string = ''
  ) {
    const post = new Post();
    post.id = id;
    post.title = title;
    post.body = body;
    post.author = author;
    post.date = date;
    post.authorImage = authorImage;
    return post;
  }
}