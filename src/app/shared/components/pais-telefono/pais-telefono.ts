import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ContriesService } from '../../../core/services/contries-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pais-telefono',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './pais-telefono.html',
  styleUrl: './pais-telefono.css'
})
export class PaisTelefono {
  @Input() parentForm!: FormGroup;
  countries: any[] = [];

  constructor(private countriesService: ContriesService) {}

  ngOnInit() {
    this.countries = this.countriesService.getCountries();
  }

  onCountryChange(code: string) {
    const country = this.countries.find(c => c.code === code);
    if (country) {
      const telefonoCtrl = this.parentForm.get('numero');
      if (telefonoCtrl && !telefonoCtrl.value?.startsWith(country.callingCode)) {
        telefonoCtrl.setValue(country.callingCode + ' ');
      }
    }
  }
}
