import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';
import {SearchService} from './search.service';
import {Tweet} from '../app.models';
import {ActivatedRoute, Router} from '@angular/router';


/**
 * todo -- add an event listener for scroll
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  private tweets: Tweet[];
  private searchKeyword = '';
  private node;

  private from = 0;
  private size = 25;

  constructor(private elementRef: ElementRef, private searchService: SearchService,
              private route: ActivatedRoute, private renderer: Renderer2, private router: Router) {
  }

  ngOnInit() {

    this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {
      if (event.target.classList.contains('hashtag')) {
        this.searchKeyword = event.target.innerHTML.substring(1);
        this.router.navigate(['search'], {queryParams: {searchKeyword: decodeURI(this.searchKeyword), hashtag: true}});
      } else if (event.target.classList.contains('mention')) {
        this.searchKeyword = event.target.innerHTML.substring(1);
        this.router.navigate(['search'], {queryParams: {searchKeyword: decodeURI(this.searchKeyword), mention: true}});
      } else if (event.target.classList.contains('tiny-url')) {
        window.open(event.target.innerHTML);
      }
    });

    this.route.queryParams
      .subscribe(params => {
        this.searchKeyword = params['searchKeyword'];
        this.node = params['hashtag'] ? 'hashtag' : params['mention'] ? 'mention' : null;
        this.doSearch(false);
      });
  }

  /**
   * @param concat: true meaning its coming from scroll event
   */
  doSearch(concat: boolean = false) {
    this.from = concat ? this.from + this.size : 0;

    let params = {
      from: this.from,
      size: this.size,
      node: this.node
    };

    this.searchService.search(this.searchKeyword, params).subscribe(tweets => {
      this.tweets = concat ? this.tweets.concat(tweets) : tweets;
    });

  }

}
