export interface UserModel {
    creationDate: number;
    firstName: string;
    lastName: string;
    memberId?: string;
    requestId?: number;
    role: string;
    status?: string;
    owner?: string;
}

export enum StatusEnum {
    REJECTED,
    PENDING,
    ACCEPTED
}
