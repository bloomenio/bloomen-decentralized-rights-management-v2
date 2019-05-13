import { Service } from 'typedi';

import { SearchItemSoundRecording, SearchItemMusicalWork } from '../search/interfaces/search.interface';
import * as solr from 'solr-client';

import * as  jsonPathLibrary from 'json-path-value';
const jsonPath = new jsonPathLibrary.JsonPath();

@Service()
export class SolrService {

    private solrClient: any = solr.createClient(process.env.SOLR_HOST, process.env.SOLR_PORT, process.env.SOLR_CORE, process.env.SOLR_PATH);

    private _solrUnmarshall(doc){
        const pathValues = [];
        Object.keys(doc).forEach( property => {
                const value = doc[property] + '';

                if (property.endsWith('_s')) {
                    pathValues.push(new jsonPathLibrary.JsonPathPair(property.substring(0, property.length - 2), value, 'string', '' ));
                }
                else if (property.endsWith('_b')) {
                    pathValues.push(new jsonPathLibrary.JsonPathPair(property.substring(0, property.length - 2), value, 'boolean', ''));
                }
                else if (property.endsWith('_i')) {
                    pathValues.push(new jsonPathLibrary.JsonPathPair(property.substring(0, property.length - 2), value, 'number', ''));
                }
                else {
                    pathValues.push(new jsonPathLibrary.JsonPathPair(property, value, 'string', 0));
                }

            });

        return jsonPath.unMarshall(pathValues);
    }

    public getSearch(query: string , limit: number , offset: number ): Promise<any[]> {
        const resultPromise = new Promise<any[]>((resolve, reject) => {

            const queryObj = this.solrClient.createQuery()
                .q({ _text_: '*' + query + '*' })
                .start(offset)
                .rows(limit);

            this.solrClient.search(queryObj, (err, obj) => {

                if (obj) {
                    const resultData = [];
                    for (const doc of obj.response.docs) {
                        resultData.push(this._solrUnmarshall(doc));
                    }
                    resolve(resultData);
                }

            });
        });
        return resultPromise;
    }

    public countSearch(query: string ): Promise<number> {
        const resultPromise = new Promise<number>((resolve, reject) => {

            const queryObj = this.solrClient.createQuery()
                .q({ _text_: '*' + query + '*' })
                .start(0)
                .rows(1);

            this.solrClient.search(queryObj, (err, obj) => {

                if (obj) {
                    resolve(obj.response.numFound);
                }

            });
        });
        return resultPromise;
    }
}