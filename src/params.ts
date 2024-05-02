
export const getParams = (url: string | null, pathname: string) => {
    const patternSegments = pathname?.split('/');
    const pathSegments = url?.split('/');
    if (patternSegments?.length === pathSegments?.length && pathname !== url) {
        const paramRegex = /\/:([^/]+)/g;
        const parameterRegex = new RegExp(pathname?.replace(/:[^/]+/g, '([^/]+)'));
        const match = url?.match(parameterRegex);
        if (match) {
            const parameterValues = match?.slice(1);
            const paramsKeyValue: any = pathname?.match(paramRegex)?.map((key: string, index: number) => {
                return {
                    [key?.slice(2)]: parameterValues[index]
                }
            })
            if (paramsKeyValue?.length) {
                return paramsKeyValue.reduce(function (total: any, value: any) {
                    return { ...total, ...value }
                }, {});
            }
            else {
                return {}
            }
        }
        else {
            return {}
        }
    }
    else {
        return {}
    }
}

[{ text: 'xxx' }, { tex: 'fsdf', tx: '5345' }]