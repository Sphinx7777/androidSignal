

export enum ROLE {
    GUEST = 'guest',
    LEAD = 'lead',
    USER = 'user',
    ADMIN = 'admin',
}

export enum GRANT {
    // for buisness logic
    READ = 'read',
    WRITE = 'write',
    EXECUTE = 'execute',

    // for http requests
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export interface ISecretRole {
    role: ROLE;
    companyId: any;
    secret: string;
    url: string;
}

export interface IIdentity {
    userId: any;
    firstName: string,
    lastName: string,
    userEmail: string;
    token?: string;
    current: ISecretRole;
    secrets: ISecretRole[];
    locale: string;
}

export interface IRoleData {
    display: string;
    url: string;
    parent?: ROLE[];
    private?: boolean;
}

export interface IRoles {
    [key: string]: IRoleData;
}

export interface IGrants {
    [key: string]: string[];
}

export interface IAllowDeny {
    allow: IGrants;
    deny?: IGrants;
}

export interface IRules {
    [key: string]: IAllowDeny;
}

export interface IIdentityACL {
    user: any;
    roles: IRoles;
    rules: IRules;
}