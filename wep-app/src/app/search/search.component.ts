import {Component, OnInit} from '@angular/core';
import {SearchService} from './search.service';
import {Tweet} from '../app.models';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  private tweets: Tweet[];
  private searchKeyword = '';

  constructor(private searchService: SearchService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.searchKeyword = params['searchKeyword'];
        this.doSearch();
      });
  }

  doSearch() {
    this.searchService.search(this.searchKeyword).subscribe(tweets => {
      this.tweets = tweets;
    });

  }

}
