import {Injectable} from '@angular/core';
import {HttpMsgClientService} from "../../httpMsgClient.service";

@Injectable()
export class BlogService {

  constructor(private hmcs: HttpMsgClientService) {
  }

  getArticles() {
    return this.hmcs.sget("/api/blog/articlelist").map((response: any) => {
      return response.articles;
    }).toPromise();
  }

  getArticle(id: number) {
    return this.hmcs.sget("/api/blog/article/" + id).toPromise();
  }

  post(article: any) {
    return this.hmcs.post("/api/blog/article//", article).toPromise();
  }
  update(article: any) {
    return this.hmcs.put("/api/blog/article/"+article.id+"/", article).toPromise();
  }
  delete(id: number) {
    return this.hmcs.sdelete("/api/blog/article/" + id).toPromise();
  }
  get_category_tree() {
    return this.hmcs.sget("/api/blog/categorytree").toPromise();
  }

  post_category(category: any) {
    return this.hmcs.post("/api/blog/category//", category).toPromise();
  }
  update_category(category:any){
    return this.hmcs.put("/api/blog/category/"+category.cate_id+"/", category).toPromise();
  }
  delete_category(id:number){
    return this.hmcs.sdelete("/api/blog/category/"+id+"/").toPromise();
  }
}
