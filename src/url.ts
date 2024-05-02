type setKeyType = {
    hash: string | null,
    protocol: string | null,
    origin: string | null,
    username: string | null,
    password: string | null,
    hostname: string | null,
    port: string | null,
    href: string | null,
    query: {
        [key: string]: string
    },
    path: string | null
}

export
    class Url {
    #url: string;
    #urlString: string
    constructor(url: string) {
        this.#url = url
        const { protocol, hash, hostname, origin, password, path, port, query, username } = this.urlParse
        const queryCheck = Object?.entries(query)?.map(r => {
            return `${r?.[0]}=${r?.[1]}`
        })?.join('&');

        this.#urlString = `${protocol ?
            `${protocol}://` : ""
            }${username ? username : ""}${password ? `:${password}@` : username ? "@" : ""}${hostname || ""}:${port || ''}${path || ''}${queryCheck ? `?${queryCheck}` : ""}${hash ? `#${hash}` : ""}`;
    }
    get urlParse(): setKeyType {
        const url = this.#url

        const queryRegex = /\?([^#]*)/,
            authRegex = /\/\/(?:([^:]+)(?::([^@]+)))?/,
            pathnameRegex = /(?:^[^:]+:\/\/[^/]+)?(\/[^?#]*)/,
            portRegex = /:(\d+)/,
            hashRegex = /#([^]*)/,
            protocolRegex = /^(?:([^:]+):\/\/)?(?:([^:]+))/,
            urlRegex = /^(?:(\w+):\/\/)?(?:([^:]+)(?::([^@]+))?@)?([a-zA-Z0-9.-]+|(?:\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+\])(?::(\d+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;

        function query() {
            // Extract the query part of the URL
            const queryMatch = url.match(queryRegex);
            if (queryMatch && queryMatch[1]) {
                const queryPart = decodeURIComponent(queryMatch[1]);
                // Split the query into individual key-value pairs
                const keyValuePairs = queryPart.split('&')
                const paramsObj: Array<{ [key: string]: any }> = keyValuePairs?.map(keyValue => {
                    const [key, value] = keyValue.split('=');
                    return {
                        [key]: value
                    }
                });
                return paramsObj.reduce(function (total: any, value: any) {
                    return { ...total, ...value }
                }, {});

            } else {
                return {}
            }
        }

        const matches = url.match(urlRegex);
        const hashMatch = url.match(hashRegex);
        const hash = hashMatch && hashMatch[1] || null;
        const protocol = matches && matches[1] || null;
        const username = matches && matches[2] || null;
        const password = matches && matches[3] || null;
        const hostname = matches && matches[4] || null;
        const port = matches && matches[5] || null;

        const path = url?.match(pathnameRegex)?.[1] || null;
        const origin = matches && (
            hostname ?
                (
                    protocol ?
                        `${protocol}://${hostname}${port ? `:${port}` : ""}`
                        : `${hostname}${port ? `:${port}` : ""}`
                )
                : null
        ) || null

        return {
            path,
            hash,
            protocol,
            origin,
            username,
            password,
            hostname,
            href: url,
            port,
            query: query(),
        }
    }
    get(key: 'hostname' | 'path' | 'protocol' | 'username' | 'origin' | 'password' | 'query' | 'port' | 'hostname' | 'origin' | 'hash') {
        return this.urlParse[key]
    }
    toString() {
        return this.#urlString
    }
    set(
        key: 'hostname' | 'path' | 'protocol' | 'username' | 'origin' | 'password' | 'query' | 'port' | 'hostname' | 'origin' | 'hash',
        value: string | { [key: string]: any }
    ) {
        const new_url = {
            ...this.urlParse,
            [key]: value
        }
        const { protocol, hash, hostname, origin, password, path, port, query, username } = new_url
        const queryCheck = Object?.entries(query)?.map(r => {
            return `${r?.[0]}=${r?.[1]}`
        })?.join('&');

        this.#urlString = `${protocol ?
            `${protocol}://` : ""
            }${username ? username : ""}${password ? `:${password}@` : username ? "@" : ""}${hostname || ""}:${port || ''}${path || ''}${queryCheck ? `?${queryCheck}` : ""}${hash ? `#${hash}` : ""}`;
    }
}

