import { Module } from '@nestjs/common';
import { SolrService } from './solr.service';

@Module({
    imports: [],
    controllers: [],
    providers: [SolrService],
})
export class SolrModule { }
