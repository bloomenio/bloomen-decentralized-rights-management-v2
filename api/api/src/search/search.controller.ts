import { Get, Controller, Query } from '@nestjs/common';
import { SearchService } from './search.service';

//Swagger
import { ApiUseTags , ApiBearerAuth} from '@nestjs/swagger';
import { SearchItemSoundRecording, SearchItemMusicalWork } from './interfaces/search.interface';

@Controller('/')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @ApiUseTags('Search')
    @ApiBearerAuth()
    @Get('/search')
    async search(@Query('offset') offset: number, @Query('limit') limit: number, @Query('q') q: string):
     Promise<SearchItemSoundRecording|SearchItemMusicalWork[]> {
        return this.searchService.search(q, limit, offset);
    }

    @ApiUseTags('Search')
    @ApiBearerAuth()
    @Get('/count')
    async count(@Query('q') q: string): Promise<number> {
        return this.searchService.count(q);
    }
}