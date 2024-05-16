import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, mergeMap, Observable, take } from 'rxjs';
import { HttpOptions } from '../adapter/model';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDialog} from "@angular/material/dialog";
import {CallbackDialogComponent} from "./callback-dialog/callback-dialog.component";

@Component({
  selector: 'tghv-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss',
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(CallbackDialogComponent, {
      width: '400px',
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const code = this.route.snapshot.queryParamMap.get('code');
        if (code) {
          this.invokeCallback(code);
        } else {
          this.sendHome();
        }
      }
    })
  }
  ngOnInit(): void {
    this.openDialog();
  }

  public invokeCallback(code: String): void {
    this.getHttpOptions()
      .pipe(
        mergeMap((options) => {
          const params = new HttpParams().set('code', code.toString() || '');
          return this.http.get<void>(environment.apiUrl + '/auth/callback', {
            ...options,
            params,
            observe: 'response',
          });
        }),
        take(1),
        catchError((error) => {
          switch (error.status) {
            case 401:
              this.sendHome();
              break;
            case 428:
              window.location.href = environment.installationUrl;
              break;
          }
          this.snackBar.open(`Token callback failed, status ${error.status > 0 ? error.status : 'n/a'}`,
            'Close', {
              duration: 2000,
              verticalPosition: 'top',
              panelClass: 'error-snackbar',
            });
          throw error;
        }),
      )
      .subscribe(() => {
        this.sendHome();
      });
  }

  private getHttpOptions(): Observable<HttpOptions> {
    const accessToken = this.oidcSecurityService.getAccessToken();
    if (accessToken) {
      return accessToken.pipe(
        map((token) => ({
          headers: new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + token),
        })),
      );
    } else {
      this.sendHome();
      throw new Error('User is not authenticated');
    }
  }

  private sendHome() {
    window.location.href = environment.homeUrl;
  }
}
