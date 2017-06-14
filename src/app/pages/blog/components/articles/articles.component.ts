import {Component} from '@angular/core';
import {BlogService} from "../../blog.service";
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'articles',
  templateUrl: './articles.html',
  styleUrls: ['./articles.scss']
})
export class Articles {

  articles;

  constructor(private blogService: BlogService,private notificationsService: NotificationsService) {

  }

  ngOnInit() {
    this.blogService.getArticles().then((articles: any) => {
      this.articles = articles;
    });
  }

  remove(item) {
    this.blogService.delete(item.id).then((response:any)=>{
      if(response.status>0){
        this.notificationsService.success('lists',response.msg);
        this.articles.pop(item);
      }else{
        this.notificationsService.alert('lists',response.msg);
      }
    });
  }
}
