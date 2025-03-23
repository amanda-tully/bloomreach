import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSearch',
})
export class FilterSearchPipe implements PipeTransform {
  transform(items: any[], searchTerm: string, property?: string): any[] {
    if (!items || !searchTerm) {
      return items;
    }

    searchTerm = searchTerm.toLowerCase();

    return items.filter((item) => {
      const value = property ? item[property] : item;
      return value.toLowerCase().includes(searchTerm);
    });
  }
}
