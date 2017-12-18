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

  search(searchKeyword: string, params: any): Observable<Tweet[]> {
    let url = `${this.searchApiUrl}?keyword=${searchKeyword}`;
    if (params && params.node) {
      url += '&' + params.node + '=true';
      delete params.node;
    }
    return this.http.get(url, params)
      .map(res => {
        return res.json().list.map(item => {
          return new Tweet(item.createdAt, item.text, item.userId, item.uuid);
        });
      });
  }

}
