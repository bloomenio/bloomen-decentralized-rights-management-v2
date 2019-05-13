import { Module } from '@nestjs/common';

import { SearchModule } from 'search/search.module';
import { SolrModule } from 'solr/solr.module';
@Module({
  imports: [
    SearchModule,
    SolrModule,
  ],
  providers: [],
})
export class AppModule { }
