import { Action } from '@ngrx/store';
import { AssetModel } from '@core/models/assets.model';


export enum RepertoireActionTypes {
    COUNT_REPERTOIRE_GROUPS = '[REPERTOIRE] count Repertoire groups',
    COUNT_REPERTOIRE_GROUPS_SUCCESS = '[REPERTOIRE] count Repertoire groups success',
    SEARCH_REPERTOIRE_LIST = '[REPERTOIRE] init Repertoire list',
    SEARCH_REPERTOIRE_LIST_SUCCESS = '[REPERTOIRE] init Repertoire list success',
    SEARCH_REPERTOIRE_COUNT = '[REPERTOIRE] init Repertoire count',
    SEARCH_REPERTOIRE_COUNT_SUCCESS = '[REPERTOIRE] init Repertoire count success',
    REMOVE_CURRENT_REPERTOIRE_SEARCH = '[REPERTOIRE] remove current Repertoire'
}

export class CountRepertoireGroups implements Action {
    public readonly type = RepertoireActionTypes.COUNT_REPERTOIRE_GROUPS;
    constructor() { }
}

export class CountRepertoireGroupsSuccess implements Action {
    public readonly type = RepertoireActionTypes.COUNT_REPERTOIRE_GROUPS_SUCCESS;
    constructor(public readonly payload: any[]) {}
}

export class RepertoireSearch implements Action {
    public readonly type = RepertoireActionTypes.SEARCH_REPERTOIRE_LIST;
    constructor(public readonly payload: { filter: string, pageIndex: number, pageSize: number }) {
        // console.log('ACTIONS: RepertoireSearch');
    }
}

export class RepertoireSearchSuccess implements Action {
    public readonly type = RepertoireActionTypes.SEARCH_REPERTOIRE_LIST_SUCCESS;
    constructor(public readonly payload: any[]) {  // AssetModel[]
        // console.log('ACTIONS: RepertoireSearchSuccess');
    }
}

export class RepertoireSearchCount implements Action {
    public readonly type = RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT;
    constructor(public readonly payload: { filter: string }) { }
}

export class RepertoireSearchCountSuccess implements Action {
    public readonly type = RepertoireActionTypes.SEARCH_REPERTOIRE_COUNT_SUCCESS;
    constructor(public readonly payload: number) { }
}

export class RemoveRepertoire implements Action {
    public readonly type = RepertoireActionTypes.REMOVE_CURRENT_REPERTOIRE_SEARCH;
    constructor() { }
}

export type RepertoireActions = RepertoireSearch | RepertoireSearchSuccess | RepertoireSearchCount | RepertoireSearchCountSuccess | RemoveRepertoire;
