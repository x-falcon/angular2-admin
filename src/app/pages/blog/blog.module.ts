import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routing } from './blog.routing';
import { TreeModule } from 'ng2-tree';
import { Blog } from './blog.component';
import { Articles } from "./components/articles/articles.component";
import { PostComponent } from './components/post/post.component';
import { BlogService } from "./blog.service";
import { CodemirrorModule } from 'ng2-codemirror';
import { FilemodalComponent } from './components/post/modal/filemodal/filemodal.component';
import { LinkmodalComponent } from './components/post/modal/linkmodal/linkmodal.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule.forRoot(),
    NgbModule.forRoot(),
    routing,
    TreeModule,
    CodemirrorModule,
  ],
  declarations: [
    Blog,
    Articles,
    PostComponent,
    FilemodalComponent,
    LinkmodalComponent,
  ],
  providers: [
    BlogService,
  ],
  entryComponents: [
    LinkmodalComponent,
    FilemodalComponent,
  ],
})

export class BlogModule {}
