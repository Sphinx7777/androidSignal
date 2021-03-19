// import { GRANT, ROLE } from 'src/acl/types';
import { ReactNode } from 'react';

export const PAGE_SIZE_10 = 5;

export const MAX_IMAGE_SIZE = 10000000; // 1M
export const ADMIN_USER_LIST_SIZE = 15;

export const ENTITY_PAGE = 'pages';

export const LANDING_PAGE = 'home';
export const ABOUT_US = 'about_us';
export const CONTACT_US = 'contact_us';

export enum ENTITY {
    BLOCKED_IP = 'blockedIp',
    USER = 'users',
    PAGES = 'pages',
    MENU = 'menu',
    LEADS_ACTIONS = 'leadsActions',
    EMAIL_TEMPLATES = 'emailTemplates',
    SUBCATEGORY = 'subcategory',
    POSTS = 'posts',
    SIGNAL_DATA = 'signalData'
}
export enum PostContentType {
    POST_TEXT = 'POST_TEXT',
    POST_GRADIENT = 'POST_GRADIENT',
    POST_VIDEO = 'POST_VIDEO',
    POST_PROFILE = 'POST_PROFILE',
    POST_IMAGES = 'POST_IMAGES',
}
export const TIME_UPDATE_SESSION = 3600000;
export const TOAST_TIME = 5000;  // milliseconds to display toast message
export const TIMING_NEW_ENTRY_IN_BASE = 180000; // timing of creating a new entry in the database when the user visits the page again

export enum ConfirmRequestMethod {
    PASSWORD = 'password',
    REGISTRATION = 'registration',
}

export enum Is {
    YES = 1,
    NO = 0,
}

// export interface InjectedIdentityProps {
//     allow?: (grant: GRANT, res?: string, role?: ROLE) => boolean;
//     identity?: any;
// }

export interface ISeoMeta {
    content: string;
    [key: string]: string;
}

export enum MessageType {
    INFO = 'info',
    ERROR = 'error',
    WARNING = 'success',
}

export enum UserTable {
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    EMAIL = 'userEmail',
    ROLE = 'role',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
}

export enum ResCode {
    FORM = 'form',
    TOAST = 'toast',
    DEBUG = 'debug',
    ALERT = 'alert',
}

export enum ContentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export enum EmailTemplates {
    NAME = 'name',
    TITLE = 'title',
}

export enum FriendsType {
    REQUESTS = 'requests',
    APPROVED = 'approved',
    FOLLOWINGS = 'followings',
    SUBSCRIBERS = 'subscribers',
}

export enum PageType {
    WEB_PAGE = 'webPage',
    HARDCODE = 'hardcode',
    BOOK_PAGE = 'bookPage',
    THANK_PAGE = 'thankPage',
}

export interface IMessageBlock {
    text: string;
    code: ResCode;
    msgType: MessageType;
}

export enum HTTP_METHOD {
    PUT = 'PUT',
    POST = 'POST',
    GET = 'GET',
    DELETE = 'DELETE',
}

export interface IOptions {
    label: string;
    value: string | number;
}

type ReactIcon = (props?: any) => ReactNode;
export interface IMenuData {
    icon?: ReactIcon
    label: string;
    component?: any;
    url?: string;
    hide?: boolean;
    resources?: string[];
    items?: IMenu;
    // grant?: GRANT;
    data?: any; // save any data within menu item
    route?: string;
    order?: number;
    handler?: any;
}

export interface IMenu {
    [key: string]: IMenuData;
}

export interface IJustId {
    id: string;
}

export interface IJustCode {
    code: string;
}

export interface IJustName {
    name: string;
}

export interface IUserId {
    userId: string;
}

export interface IUser {
    userId?: string;
    firstName?: string;
    lastName?: string;
    userEmail?: string;
    phone?: string;
    overview?: string;
    friends?: IFriends;
    token?: string;
    current?: any;
    secrets?: any;
    suspended?: boolean;
    role?: string;
    locale?: string;
    id?: string;
    avatar?: string;
}

export interface IFriends {
    requests?: Array<string>;
    approved?: Array<string>;
    followings?: Array<string>;
    subscribers?: Array<string>;
}

export enum Actions {View = 1, Edit = 2, Delete = 3, Request = 4, Add = 5 }
export enum Sort { ASC = 1, DESC = -1, none = 0 }
export enum FilterType {  Text = 1, CheckBox = 2, Select = 3, Radio = 4, DateRange = 5, Touche = 6, RadioButton = 7 }
export enum InputIcon { EMAIL= 'email', SPINNER= 'spinner', SEARCH= 'search', PASSWORD= 'password', ERROR= 'error'}

export interface IColumn {
    title: string;
    dataIndex: string;
    key: string;
    filter?: {
        type: FilterType;

    };
}
export interface IPagerParams {
    pageName?: string;  // paginator name
    sort?: object;      // object with sorting key/values
    filter?: object;    // object with filtering key/values
    page?: number;       // page number
    perPage: number;    // count items on one page
    force?: boolean;    // reload data in the redux and pager
    count?: number;     // count by filter, if 0 need to recalculate, if > 0 count doesn't need to calculate
}

export interface IPaginationPage {
    ids: string[];
}

export interface IPagination {
    currentPage: number;
    fetching: boolean;
    count: number;
    pages: IPaginationPage[];
    filter: any;
    sort: {
        field: string,
        sort: number,
    };
}

export interface IField {
    label?: string;
    placeholder?: string;
    type?: FilterType;
    initialValue?: any;
    column?: {
        className?: string;
        sorted?: boolean;
        editable?: boolean;
        draw?: (object: any, field?: string) => void;
        image?: boolean;
        disabled?: (object: any, field?: string) => void;
        options?: {
            label: string;
            value: string;
        }[]
    };
    filter?: {
        group: string;
        className?: string;
        showLabel?: boolean;
        icon?: InputIcon;
        endDate?: object, // only for dateRangePicker
        startDate?: object, // only for dateRangePicker
        options?: {
            label: string;
            value: string;
        }[]
    };
}

export interface IFieldList {
    [field: string]: IField;
}

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
};

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export enum typePagination  {
    LIGHT = 'LIGHT',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

export enum flagger {
    IN_OFFICE_RADIUS = 'IN_OFFICE_RADIUS',
}

export enum ADMIN_ACTIONS_CRUD {
    SAVE = 'SAVE',
    REMOVE = 'REMOVE',
    ADD = 'ADD',
    PREVIEW = 'PREVIEW',
}

export const PATH_ORIGINAL_IMAGES = 'original-images';


export enum ScheduleFrames {
    SelectOption = 1,
    Calendar = 2,
    MeetingConfirm = 3,
    MeetingConfirmTwoHours = 4,
    BookingConfirmed = 5
}

export enum ScheduleScenario {
    Meeting30Minutes = 1,
    Meeting2Hours = 2
}

export enum LIKES_TYPES {
    DEFAULT = 'DEFAULT',
    HEART = 'HEART',
    HA_HA = 'HA_HA'
}
