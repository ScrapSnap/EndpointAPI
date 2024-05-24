export enum Permission {
    /** Users  **/
    READ_USERS = 100,
    WRITE_USERS = 101,
    DELETE_USERS = 102,

    /** Schedules **/
    WRITE_SCHEDULES = 201,
    DELETE_SCHEDULES = 202,

    /** Collection Points **/
    WRITE_COLLECTION_POINTS = 301,
    DELETE_COLLECTION_POINTS = 302,

    /** User Statistics **/
    READ_USER_STATISTICS = 401,
    WRITE_USER_STATISTICS = 402,
    DELETE_USER_STATISTICS = 403,
}

export const getAllPermissions = (): number[] => {
    return Object.values(Permission).filter(value => typeof value === 'number') as number[];
};
