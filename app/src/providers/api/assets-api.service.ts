import {Inject, Injectable, Input} from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AssetModel } from '@core/models/assets.model';
// import * as curl from '@';

@Injectable({ providedIn: 'root' })
export class AssetsApiService {

    constructor(
        private httpClient: HttpClient
        // @Inject(RepertoireComponent) public repertoireComponent
    ) { }

    // @Inject(Number) public repertoirePageIndex: any;
    public nextLength = 0;
    public page: number;
    public total_count: number;
    public urlInit = `https://bloomen.herokuapp.com/sound/search?page=`;
    public url = `https://bloomen.herokuapp.com/sound/search`;
    public type: string;
    public group = 'second';
    public groups = ['second'];
    public productionMode = true;   // True for Bloomen API (production mode); False for Repertoire DB (testing mode).
    private headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        // tslint:disable-next-line:max-line-length
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOlsicHVibGlzaGVyIiwiYWRtaW4iXSwicmVwdXRhdGlvbiI6eyJwb3NpdGl2ZSI6MCwibmVnYXRpdmUiOjB9LCJzZXR0aW5ncyI6eyJhdHRyaWJ1dGlvbiI6dHJ1ZX0sImt5YyI6eyJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJmaXJzdG5hbWUiOiIiLCJsYXN0bmFtZSI6IiIsImlkMSI6IiIsImlkMiI6IiIsInN0YXR1cyI6MCwicmV2aWV3ZWRCeSI6IiJ9LCJfaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYiLCJ1c2VybmFtZSI6InB1Ymxpc2hlciIsImhhc2giOiI1MmFkZWQxNjUzNjAzNTJhMGY1ODU3NTcxZDk2ZDY4ZiIsImVtYWlsIjoicHVibGlzaGVyQGNvbXBhbnkuZ3IiLCJvcmdhbmlzYXRpb24iOiJBVEMiLCJjcmVhdGVkQXRVVEMiOiIyMDE4LTA4LTA5VDEzOjA3OjI4LjA5NloiLCJfX3YiOjAsIm9yZyI6bnVsbCwiaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYifSwiaWF0IjoxNTY3NjAyODEyfQ.jEDLx6KK2LBVpBjzHNB7mIX-mLQy_fXgwV0hG2agfnU')
        .set('accept', 'application/json')
        // .set('body', '{\"term\": \"\"}') DONT!
    ;

    public getGroups(): Observable<any[]> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            // tslint:disable-next-line:max-line-length
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InJvbGUiOlsicHVibGlzaGVyIiwiYWRtaW4iXSwicmVwdXRhdGlvbiI6eyJwb3NpdGl2ZSI6MCwibmVnYXRpdmUiOjB9LCJzZXR0aW5ncyI6eyJhdHRyaWJ1dGlvbiI6dHJ1ZX0sImt5YyI6eyJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJmaXJzdG5hbWUiOiIiLCJsYXN0bmFtZSI6IiIsImlkMSI6IiIsImlkMiI6IiIsInN0YXR1cyI6MCwicmV2aWV3ZWRCeSI6IiJ9LCJfaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYiLCJ1c2VybmFtZSI6InB1Ymxpc2hlciIsImhhc2giOiI1MmFkZWQxNjUzNjAzNTJhMGY1ODU3NTcxZDk2ZDY4ZiIsImVtYWlsIjoicHVibGlzaGVyQGNvbXBhbnkuZ3IiLCJvcmdhbmlzYXRpb24iOiJBVEMiLCJjcmVhdGVkQXRVVEMiOiIyMDE4LTA4LTA5VDEzOjA3OjI4LjA5NloiLCJfX3YiOjAsIm9yZyI6bnVsbCwiaWQiOiI1YjZjM2M5MDljOGU3NTBhYjRjN2YxMWYifSwiaWF0IjoxNTY3NjAyODEyfQ.jEDLx6KK2LBVpBjzHNB7mIX-mLQy_fXgwV0hG2agfnU')
            .set('accept', 'application/json')
            // .set('Access-Control-Allow-Origin', '*');

        // .set('body', '{\"term\": \"\"}') DONT!
        ;
        // this.httpClient
        //     .get(`https://bloomen.herokuapp.com/sound/groups`, {headers})
        //     .pipe(
        //         map((body: any) => body),
        //         catchError(() => of('Error, could not load assets :-('))
        //     )
        //     .subscribe(data => {console.log('heroku API: ', data); } )
        //     ;
        return this.httpClient
            .get(`https://bloomen.herokuapp.com/sound/groups`, {headers})
            .pipe(
                map((body: any) => body),
                catchError(() => of('Error, could not load assets :-('))
            )
        ;
    }

    public getAssets(filter: string, pageIndex: number, pageSize: number): Observable<any[]> {  //  : Observable<AssetModel[]>

        const params = new HttpParams()
                // .set('q', '')
                .set('q', filter)
                .set('limit', String(pageSize))
                .set('offset', String(pageIndex * pageSize))
            // .set('data', '{\"term\": \"\"}') DONT!
        ;

        // console.log('API TYPE: ', this.type);
        if ( !this.productionMode && (this.type === 'all' || this.type === 'iswc' || this.type === 'isrc')) {
            return this.httpClient
                .get(`https://regtool.wlilab.eu/api/search`, {params})
                .pipe(
                    map((body: any) => body),
                    catchError(() => of('Error, could not load assets :-('))
                )
                // .subscribe(data => {console.log('WLI: ', data); } ).add(data => {temp = data; })
                ;
        } else {
            const assetsFromAllGroups = [];
            // console.log('q: ', params.get('q'));
            // console.log('page: ', this.page);
            let i: number;
            // this.groups = ['second'];
            for (i = 0; i < this.groups.length; i++) {
                this.group = this.groups[i];
                const body = '{\"term\": \"' + params.get('q') + '\", \"group\": \"' + this.group + '\"}';
                assetsFromAllGroups.push(
                    this.httpClient
                        .post(this.urlInit + this.page, body, {
                            headers: this.headers,
                            params: params
                        })
                        // .subscribe(data => { this.tempo = data; })
                        .pipe(
                            map((data: any) => {
                                // console.log(data.results);
                                // console.log(data.total_count);
                                this.total_count = data.total_count;
                                if (this.type === 'iswc') {
                                    return data.results.filter((x: any) => x.ISWC);
                                } else if (this.type === 'isrc') {
                                    return data.results.filter((x: any) => x.ISRC);
                                } else {
                                    return data.results;
                                }
                        }))
                );
                // assetsFromAllGroups.push(
                //     this.httpClient
                //         .post(this.urlInit + Number(this.page + 1), body, {
                //             headers: this.headers,
                //             params: params
                //         })
                //         // .subscribe(data => { this.tempo = data; })
                //         .pipe(
                //             map((data: any) => {
                //                 if (this.type === 'iswc') {
                //                     return data.filter((x: any) => x.ISWC);
                //                 } else if (this.type === 'isrc') {
                //                     return data.filter((x: any) => x.ISRC);
                //                 } else {
                //                     return data;
                //                 }
                //             }))
                // );
                // console.log('FROM GROUP ', this.group);
                // console.log(assetsFromAllGroups);
            }
            // while (i !== this.groups.length) { }
            // console.log('assetsFromAllGroups');
            // console.log(assetsFromAllGroups);
            // console.log('forkJoin(assetsFromAllGroups)');
            // console.log(forkJoin(assetsFromAllGroups));
            return forkJoin(assetsFromAllGroups);
        }
    }

    public getAssetsCount(filter: string): Observable<any[]> {

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
            const assetsFromAllGroups = [];
            // console.log('q: ', params.get('q'), 'Count');
            let i: number;
            // this.groups = ['second'];
            for (i = 0; i < this.groups.length; i++) {
                this.group = this.groups[i];
                const body = '{\"term\": \"' + params.get('q') + '\", \"group\": \"' + this.group + '\"}';
                assetsFromAllGroups.push(
                    this.httpClient
                        .post(this.urlInit + this.page, body, {
                            headers: this.headers,
                            params: params
                        })
                        // .subscribe(data => { this.tempo = data; })
                        .pipe(
                            map((data: any) => {
                                this.total_count = data.total_count;
                                if (this.type === 'iswc') {
                                    return data.results.filter((x: any) => x.ISWC);
                                } else if (this.type === 'isrc') {
                                    return data.results.filter((x: any) => x.ISRC);
                                } else {
                                    return data.results;
                                }
                            })
                        )
                );
                // assetsFromAllGroups.push(
                //     this.httpClient
                //         .post(this.urlInit + Number(this.page + 1), body, {
                //             headers: this.headers,
                //             params: params
                //         })
                //         // .subscribe(data => { this.tempo = data; })
                //         .pipe(
                //             map((data: any) => {
                //                 if (this.type === 'iswc') {
                //                     return data.filter((x: any) => x.ISWC);
                //                 } else if (this.type === 'isrc') {
                //                     return data.filter((x: any) => x.ISRC);
                //                 } else {
                //                     return data;
                //                 }
                //             }))
                // );
                // console.log('FROM GROUP ', this.group);
                // console.log(assetsFromAllGroups);
            }
            // while (i !== this.groups.length) { }
            // console.log('assetsFromAllGroups');
            // console.log(assetsFromAllGroups);
            // console.log('forkJoin(assetsFromAllGroups)');
            // console.log(forkJoin(assetsFromAllGroups));
            return forkJoin(assetsFromAllGroups);

            // return this.httpClient
            //     .post(`https://bloomen.herokuapp.com/sound/search`,
            //         '{\"term\": \"'  +
            //         params.get('q') +
            //         '\", \"group\": \"' +
            //         this.group +
            //         '\"}',
            //         {
            //             headers: this.headers,
            //             params: params
            //         })
            //     .pipe(
            //         map((data: any) => {
            //             return data.length;
            //         })
            //     );
        }
    }
}
