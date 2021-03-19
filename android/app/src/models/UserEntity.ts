import saga from '../../src/decoradors/saga';
import action from '../../src/decoradors/action';
import Entity, { EntityMap } from './entity';
import { call, put } from 'redux-saga/effects';
import { ENTITY, HTTP_METHOD, IPagerParams, PostContentType } from '../../src/constants';
import { setFlagger } from '../../src/redux/actions';
import { List } from 'immutable';

interface IUserMap {
    userId?: string;
    firstName?: string;
    lastName?: string;
    userEmail?: string;
    phone: string;
    overview?: string;
    friends?:IFriendsMapType;
    token?: string;
    current?: any;
    secrets?: any;
    suspended?: boolean;
    role?: string;
    locale?: string;
    id?: string;
    address?: IAddressMapType;
    avatar?: string;
    avatarOrigin?: string;
    cover?: string;
    coverOrigin?: string;
}

export type IUserMapType = EntityMap<IUserMap>;

export type IFriendsMapType = EntityMap<{
    requests?: List<string>;
    approved?: List<string>;
    followings?: List<string>;
    subscribers?: List<string>;
}>;

export type IAddressMapType = EntityMap<{
    fullAddress: string;
    street: string;
    city: string;
    region: string;
    motherland: string;
    lat: number;
    lng: number;
}>;


class UserEntity extends Entity {
    constructor() {
        super(ENTITY.USER);
    }

    @action()
    public * fetchProfile() {
        yield call(this.xRead, '/user/profile');
    }

    @action()
    public * removeUser(data: any) {
        data.id = data.userId;
        const href = data.role === 'lead' ? '/user/remove-lead/' : '/user/remove-user/';
        const { response } = yield call(this.xDelete, `${href}${data.userId}`, data);
        if (response) {
            yield put(setFlagger('confirmDelete', null));
        }
    }

    @action()
    public * personalUserInfo(data: IUserMap) {
        yield call(this.xSave, '/user/change-user-profile', data);

    }

    @action()
    public * fetchUsers(data: IPagerParams) {
        yield call(this.pageEntity, '/user/list', data);
    }

    @action()
    public * fetchUserFriends(data: any) {
        yield call(this.xRead, '/user/userFriends', data, HTTP_METHOD.GET);
    }
    
    @action()
    public * unfriendFriend(data: any) {
        yield call(this.xSave, '/user/unfriendFriend', data);
    }

    @action()
    public * unfollowFriend(data: any) {
        yield call(this.xSave, '/user/unfollowFriend', data);
    }

    @action()
    public * followFriend(data: any) {
        yield call(this.xSave, '/user/followFriend', data);
    }

    @action()
    public * approveFriendRequest(data: any) {
        yield call(this.xSave, '/user/approveFriendRequest', data);
    }

    @action()
    public * deleteFriendRequest(data: any) {
        yield call(this.xSave, '/user/deleteFriendRequest', data);
    }
    

}

export default new UserEntity();
