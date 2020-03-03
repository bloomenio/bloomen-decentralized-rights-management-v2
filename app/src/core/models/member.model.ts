export interface MemberModel {
    memberId?: number;
    creationDate: number;
    name: string;
    logo: string;
    country: string;
    cmo: string;
    theme: string;
    claimInbox?: string[];
    claims?: string[];
    userRequests?: string[];
    group?: string;
    totalTokens?: number;
}
