import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(text: string): string {
    let mentions = text.match(/\B\@\w\w+\b/g);
    let hashtags = text.match(/\B\#\w\w+\b/g);

    if(mentions && mentions.length > 0){
      for(let mention of mentions){
        text = text.replace(new RegExp(mention, 'i'),
          `<a class="mention text-primary">${mention}</a>`)
      }
    }

    if(hashtags && hashtags.length > 0){
      for(let hashtag of hashtags){
        text = text.replace(new RegExp(hashtag, 'i'),
          `<a class="hashtag text-primary">${hashtag}</a>`)
      }
    }

    return text;
  }


}
