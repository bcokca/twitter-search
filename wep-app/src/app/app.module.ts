import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http'

import {AppComponent} from './app.component';
import {NavComponent} from './nav/nav.component';
import {SearchComponent} from './search/search.component';

import {Routing} from './app.routes';
import {SearchService} from './search/search.service';
import { HomeComponent } from './home/home.component';
import { HighlightPipe } from './search/highlight.pipe';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    SearchComponent,
    HomeComponent,
    HighlightPipe
  ],
  imports: [
    BrowserModule,
    Routing,
    FormsModule,
    HttpModule
  ],
  providers: [
    SearchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
