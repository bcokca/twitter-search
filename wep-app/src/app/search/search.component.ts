import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {SearchService} from './search.service';
import {Tweet} from '../app.models';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  private tweets: Tweet[];
  private searchKeyword = '';

  constructor(private elementRef: ElementRef, private searchService: SearchService,
              private route: ActivatedRoute, private renderer: Renderer2, private router: Router) {
  }

  ngOnInit() {

    this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      if (event.target.classList.contains('hashtag')) {
        this.router.navigate(['search'], {queryParams: {searchKeyword: event.target.innerHTML}});
      } else if (event.target.classList.contains('mention')) {
        this.router.navigate(['search'], {queryParams: {searchKeyword: event.target.innerHTML}});
      }
    });

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
