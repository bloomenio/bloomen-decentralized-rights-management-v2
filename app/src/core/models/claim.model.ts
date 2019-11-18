export interface ClaimModel {
    creationDate?: number;
    claimId?: number;
    oldClaimData: any;
    claimData: any;
    claimType: ClaimModel.ClaimTypeEnum;
    memberOwner?: number;
    // memberReceptor?: number;
    messageLog?: string[];
    status?: ClaimModel.StatusClaimEnum;
    lastChange?: number;
}

export namespace ClaimModel {

    export enum ClaimTypeEnum {
        MUSICAL_WORK = '0',
        SOUND_RECORDING = '1'
    }

    export enum StatusClaimEnum {
        CLAIMED,
        CONFLICT
    }
}
