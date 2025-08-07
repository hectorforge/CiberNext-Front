import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCourse } from './detail-course';

describe('DetailCourse', () => {
  let component: DetailCourse;
  let fixture: ComponentFixture<DetailCourse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCourse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailCourse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
