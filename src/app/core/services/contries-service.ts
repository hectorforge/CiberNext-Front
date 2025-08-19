import { Injectable } from '@angular/core';
import countriesData from 'world-countries';

@Injectable({
  providedIn: 'root'
})
export class ContriesService {
  getCountries() {
    return countriesData.map((c: any) => ({
      name: c.name.common,
      flag: c.flag,
      code: c.cca2,
      callingCode: `${c.idd.root || ''}${c.idd.suffixes ? c.idd.suffixes[0] : ''}`
    }));
  }
}
