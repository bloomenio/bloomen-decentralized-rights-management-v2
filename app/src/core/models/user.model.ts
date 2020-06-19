export interface UserModel {
    creationDate: number;
    firstName: string;
    lastName: string;
    memberId?: string;
    requestId?: number;
    role: string;
    status?: string;
    owner?: string;
    cmo?: string;
    groups?: string[];
    tokens?: number;
    kycData: string;
}

export enum StatusEnum {
    REJECTED,
    PENDING,
    ACCEPTED
}
