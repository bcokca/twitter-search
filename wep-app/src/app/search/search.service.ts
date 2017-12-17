import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';


import {Tweet} from '../app.models';

@Injectable()
export class SearchService {

  private searchApiUrl = 'http://localhost:3000/search';

  constructor(private http: Http) {
  }

  search(searchKeyword: string, node?: string): Observable<Tweet[]> {
    let url = `${this.searchApiUrl}?keyword=${searchKeyword}`;
    if (node) {
      url += '&' + node + '=true';
    }
    return this.http.get(url)
      .map(res => {
        return res.json().map(item => {
          return new Tweet(item.createdAt, item.text, item.userId, item.uuid);
        });
      });
  }

}
