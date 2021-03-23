
export const getStringDate: (date: Date) => string = (date: Date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate()
    return `${(d < 10 ? '0' : '') + d}/${(m < 10 ? '0' : '') + m}/${date.getFullYear()}`;
}

export function isEmpty(obj: any) {
    return [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;
}

export const MAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]/