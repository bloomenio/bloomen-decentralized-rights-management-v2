import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AssetModel } from '@core/models/assets.model';

@Injectable({ providedIn: 'root' })
export class AssetsApiService {

    constructor(
        private httpClient: HttpClient
    ) { }


    public getAssets(filter: string, pageIndex: number, pageSize: number): Observable<AssetModel[]> {

        const params = new HttpParams()
            .set('q', filter)
            .set('limit', String(pageSize))
            .set('offset', String(pageIndex * pageSize) );

        return this.httpClient
            .get(`/search`, { params })
            .pipe(
                map((body: any) => body),
                catchError(() => of('Error, could not load assets :-('))
            );
    }

    public getAssetsCount(filter: string): Observable<number> {

        const params = new HttpParams()
            .set('q', filter);

        return this.httpClient
            .get(`/count`, { params })
            .pipe(
                map((body: any) => {
                    console.log(body);
                    return body; }),
                catchError(() => of('Error, could not load assets :-('))
            );
    }
}
