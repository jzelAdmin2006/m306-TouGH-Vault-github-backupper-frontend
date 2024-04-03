import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthConfigModule } from './auth/auth-config.module';
import { OverviewComponent } from './overview/overview.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProtectionStatePipe } from './pipe/protection-state.pipe';

@NgModule({
  declarations: [AppComponent, OverviewComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatChipsModule,
    FormsModule,
    HttpClientModule,
    AuthConfigModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatRadioModule,
    NgOptimizedImage,
    MatCheckboxModule,
    ProtectionStatePipe,
  ],
  providers: [Title],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
