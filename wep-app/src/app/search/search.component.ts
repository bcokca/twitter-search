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
  private node;

  constructor(private elementRef: ElementRef, private searchService: SearchService,
              private route: ActivatedRoute, private renderer: Renderer2, private router: Router) {
  }

  ngOnInit() {

    this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      if (event.target.classList.contains('hashtag')) {
        this.router.navigate(['search'], {queryParams: {searchKeyword: event.target.innerHTML.substring(1), hashtag: true}});
      } else if (event.target.classList.contains('mention')) {
        this.router.navigate(['search'], {queryParams: {searchKeyword: decodeURI(event.target.innerHTML.substring(1)), mention: true}});
      }
    });

    this.route.queryParams
      .subscribe(params => {
        this.searchKeyword = params['searchKeyword'];
        this.node = params['hashtag'] ? 'hashtag' : params['mention'] ? 'mention' : null;
        this.doSearch();
      });
  }

  doSearch() {
    this.searchService.search(this.searchKeyword, this.node).subscribe(tweets => {
      this.tweets = tweets;
    });

  }

}
