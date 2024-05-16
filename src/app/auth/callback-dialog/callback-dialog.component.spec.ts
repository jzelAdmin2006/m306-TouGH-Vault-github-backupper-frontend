import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackDialogComponent } from './callback-dialog.component';

describe('CallbackDialogComponent', () => {
  let component: CallbackDialogComponent;
  let fixture: ComponentFixture<CallbackDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallbackDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallbackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
