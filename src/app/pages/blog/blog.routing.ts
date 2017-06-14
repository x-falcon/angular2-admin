import { Routes, RouterModule }  from '@angular/router';

import { Blog } from './blog.component';
import { Articles } from './components/articles/articles.component';
import { PostComponent } from './components/post/post.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Blog,
    children: [
      { path: 'articles', component: Articles },
      { path: 'post', component: PostComponent },
      { path: 'post/:id', component: PostComponent },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
