import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  private searchKeyword: string = '';
  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  search() {
    this.router.navigate(['search'], {queryParams: {searchKeyword: this.searchKeyword}});
  }

}
