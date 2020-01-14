import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {stringify} from 'querystring';

/**
 * Prefixes all requests with `environment.serverUrl`.
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!/^(http|https):/i.test(request.url)) {
      const newServerUrl = 'https://bloomen.herokuapp.com/sound';
      request = request.clone({ url: /* environment.serverUrl +*/ request.url  });  //  https://regtool.wlilab.eu/api//search
            // ,
            //                     setHeaders: {
            //                      tslint:disable-next-line:max-line-length
        // Authorization:  `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOlsicHVibGlzaGVyIiwiYWRtaW4iXSwicmVwdXRhdGlvbiI6eyJwb3NpdGl2ZSI6MCwibmVnYXRpdmUiOjB9LCJzZXR0aW5ncyI6eyJhdHRyaWJ1dGlvbiI6dHJ1ZX0sImt5YyI6eyJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJmaXJzdG5hbWUiOiIiLCJsYXN0bmFtZSI6IiIsImlkMSI6IiIsImlkMiI6IiIsInN0YXR1cyI6MCwicmV2aWV3ZWRCeSI6IiJ9LCJfaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYiLCJ1c2VybmFtZSI6InB1Ymxpc2hlciIsImhhc2giOiI1MmFkZWQxNjUzNjAzNTJhMGY1ODU3NTcxZDk2ZDY4ZiIsImVtYWlsIjoicHVibGlzaGVyQGNvbXBhbnkuZ3IiLCJvcmdhbmlzYXRpb24iOiJBVEMiLCJjcmVhdGVkQXRVVEMiOiIyMDE4LTA4LTA5VDEzOjA3OjI4LjA5NloiLCJfX3YiOjAsIm9yZyI6bnVsbCwiaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYifSwiaWF0IjoxNTY3NjAyODEyfQ.jEDLx6KK2LBVpBjzHNB7mIX-mLQy_fXgwV0hG2agfnU`,
        // 'Content-Type': 'application/json'
        // }
        // ,
        //                         body: JSON.stringify({
        //                           term: ''
        //                         })
      // });
      console.log('request: ', request);
    }
    return next.handle(request);
  }
}
