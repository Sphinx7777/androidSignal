// @ts-ignore
const decor = (...args: any[]) => (constructor: Function = null) => {
    for (let i = 0; i < args.length; i++) {
        console.log('decor', [args[i]]);
    }
};
export default decor;