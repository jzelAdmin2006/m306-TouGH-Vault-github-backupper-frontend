import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderSettingComponent } from './slider-setting.component';

describe('SliderSettingComponent', () => {
  let component: SliderSettingComponent;
  let fixture: ComponentFixture<SliderSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderSettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliderSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
