import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AssetModel } from '@core/models/assets.model';
// import * as curl from '@';

@Injectable({ providedIn: 'root' })
export class AssetsApiService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public type: string;
    public productionMode = true;   // True for Bloomen API (production mode); False for Repertoire DB (testing mode).
    private headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        // tslint:disable-next-line:max-line-length
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOlsicHVibGlzaGVyIiwiYWRtaW4iXSwicmVwdXRhdGlvbiI6eyJwb3NpdGl2ZSI6MCwibmVnYXRpdmUiOjB9LCJzZXR0aW5ncyI6eyJhdHRyaWJ1dGlvbiI6dHJ1ZX0sImt5YyI6eyJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJmaXJzdG5hbWUiOiIiLCJsYXN0bmFtZSI6IiIsImlkMSI6IiIsImlkMiI6IiIsInN0YXR1cyI6MCwicmV2aWV3ZWRCeSI6IiJ9LCJfaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYiLCJ1c2VybmFtZSI6InB1Ymxpc2hlciIsImhhc2giOiI1MmFkZWQxNjUzNjAzNTJhMGY1ODU3NTcxZDk2ZDY4ZiIsImVtYWlsIjoicHVibGlzaGVyQGNvbXBhbnkuZ3IiLCJvcmdhbmlzYXRpb24iOiJBVEMiLCJjcmVhdGVkQXRVVEMiOiIyMDE4LTA4LTA5VDEzOjA3OjI4LjA5NloiLCJfX3YiOjAsIm9yZyI6bnVsbCwiaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYifSwiaWF0IjoxNTY3NjAyODEyfQ.jEDLx6KK2LBVpBjzHNB7mIX-mLQy_fXgwV0hG2agfnU')
        .set('accept', 'application/json')
        // .set('body', '{\"term\": \"\"}') DONT!
    ;

    public getAssets(filter: string, pageIndex: number, pageSize: number): Observable<any[]> {  //  : Observable<AssetModel[]>

        const params = new HttpParams()
            .set('q', filter)
            .set('limit', String(pageSize))
            .set('offset', String(pageIndex * pageSize) )
            // .set('data', '{\"term\": \"\"}') DONT!
        ;

        // console.log('API TYPE: ', this.type);
        if (!this.productionMode && (this.type === 'all' || this.type === 'iswc' || this.type === 'isrc')) {
            return this.httpClient
                .get(`https://regtool.wlilab.eu/api/search`, {params})
                .pipe(
                    map((body: any) => body),
                    catchError(() => of('Error, could not load assets :-('))
                )
            // .subscribe(data => {console.log('WLI: ', data); } ).add(data => {temp = data; })
            ;
        } else {
            if (this.type === 'iswc') {
                return this.httpClient
                    .get(`https://bloomen.herokuapp.com/sound/music`, {headers: this.headers, params: params})
                    .pipe(
                        map((body: any) => body),
                        catchError(() => of('Error, could not load assets :-('))
                    )
                // .subscribe(data => {console.log('SOUND/music: ', data); } )
                ;
            } else if (this.type === 'isrc') {

                return this.httpClient
                    .get(`https://bloomen.herokuapp.com/sound/recordings`, {headers: this.headers, params: params})
                    .pipe(
                        map((body: any) => body),
                        catchError(() => of('Error, could not load assets :-('))
                    )
                // .subscribe(data => {console.log('SOUND/recordings: ', data); } )
                ;
            } else {
                return this.httpClient
                    .post(`https://bloomen.herokuapp.com/sound/search`,
                        '{\"term\": \"\"}',
                        {
                            headers: this.headers,
                            params: params
                        })
                    // .subscribe(data => { this.tempo = data; })
                    .pipe(
                        map((data: any) => {
                            // console.log('API SERVICE:');
                            // console.log(data);
                            return data;
                        })
                    );
            }
        }
    }

    public getAssetsCount(filter: string): Observable<number> {

        const params = new HttpParams()
            .set('q', filter);

        if (!this.productionMode) {
            return this.httpClient
                .get(`https://regtool.wlilab.eu/api/count`, {params})
                .pipe(
                    map((body: any) => {
                        // console.log('COUNT: ', body);
                        return body;
                    }),
                    catchError(() => of('Error, could not load assets :-('))
                );
        } else {
            return this.httpClient
                .post(`https://bloomen.herokuapp.com/sound/search`, '{\"term\": \"\"}', {
                    headers: this.headers,
                    params: params
                })
                .pipe(
                    map((data: any) => {
                        return data.length;
                    })
                );
        }
    }
}
