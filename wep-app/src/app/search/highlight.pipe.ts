import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(text: string): string {
    const mentions = text.match(/\B\@\w\w+\b/g);
    const hashtags = text.match(/\B\#\w\w+\b/g);
    const urls = text.match(/(http?:\/\/[^\s]+)/g);

    if (mentions && mentions.length > 0) {
      for (const mention of mentions) {
        text = text.replace(new RegExp(mention, 'i'),
          `<a class="mention btn-link text-primary">${mention}</a>`);
      }
    }

    if (hashtags && hashtags.length > 0) {
      for (const hashtag of hashtags) {
        text = text.replace(new RegExp(hashtag, 'i'),
          `<a class="hashtag btn-link text-primary">${hashtag}</a>`);
      }
    }

    if (urls && urls.length > 0) {
      for (const url of urls) {
        text = text.replace(new RegExp(url, 'i'),
          `<a class="tiny-url btn-link text-primary">${url}</a>`);
      }
    }

    return text;
  }


}
