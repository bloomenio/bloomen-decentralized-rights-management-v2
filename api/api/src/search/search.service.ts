import { Injectable } from '@nestjs/common';
import {  SearchItemSoundRecording, SearchItemMusicalWork } from './interfaces/search.interface';
import { SolrService } from '../solr/solr.service';

import { Container } from 'typedi';

@Injectable()
export class SearchService {

    public solrService: SolrService = Container.get(SolrService);

    async search(q: string, limit: number, offset: number): Promise<SearchItemSoundRecording|SearchItemMusicalWork[]> {
        return await this.solrService.getSearch(q, limit, offset);
    }
    async count(q: string): Promise<number> {
        return await this.solrService.countSearch(q);
    }
}
