import { Request, file } from "../src";

export async function parseFormData(req: Request, callback: () => void) {
    let body = '';
    const contentType: any = req.headers['content-type'];
    const parts: Buffer[] = [];
    // Collect the request body
    req.on('data', (chunk) => {
        body += chunk;
        parts.push(chunk)
    });

    // Parse the form data when all data is received
    req.on('end', () => {
        try {
            if (contentType == 'application/JSON') {
                req.body = JSON.parse(body);
            }
            else if (contentType == "application/x-www-form-urlencoded") {
                const pairs = body.split('&');
                const formData: { [key: string]: string } = {};
                pairs.forEach(pair => {
                    const [key, value] = pair.split('=');
                    formData[decodeURIComponent(key)] = decodeURIComponent(value || '');
                });
                req.body = formData;
            }
            else if (contentType?.includes("multipart/form-data")) {
                const formDataField: any = {};
                const formDataFieldParts = body.split('----------------------------');
                formDataFieldParts.forEach((part: string) => {
                    const match = part.match(/Content-Disposition: form-data; name="(.*)"\r\n\r\n(.*)\r\n/);
                    if (match && match.length === 3) {
                        const name = match[1];
                        const value = match[2];
                        formDataField[name] = value;
                    }
                });
                req.body = formDataField;
                const boundary = contentType.split('; ')[1].split('=')[1];
                const formData = Buffer.concat(parts);
                const formDataString = formData.toString('binary');
                // Splitting form data into parts
                const formDataParts = formDataString.split(`--${boundary}`);
                const files: file[] = [];
                for (let part of formDataParts) {
                    if (part.includes('filename')) {
                        // Extracting filename
                        const formInputKey = part.match(/name="([^"]+)"/);

                        const filenameMatch = part.match(/filename="([^"]+)"/);
                        const nameMatch = part.match(/name="([^"]+)"/);
                        const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
                        // Extracting file content
                        const fileContentStartIndex = part.indexOf('\r\n\r\n') + 4;
                        const fileContent = Buffer.from(part.substring(fileContentStartIndex), 'binary');
                        if (filenameMatch && nameMatch && contentTypeMatch && formInputKey) {
                            const filename = filenameMatch[1],
                                name = nameMatch[1],
                                contentType = contentTypeMatch[1];

                            const fileInfo = {
                                field: formInputKey[1],
                                filename: filename,
                                name: name,
                                type: contentType,
                                size: Buffer.byteLength(fileContent, 'binary'),
                                buffer: fileContent
                            };
                            files.push(fileInfo)
                        }
                    }
                }
                if (files?.length > 1) {
                    req.files = files;
                }
                else {
                    req.file = files[0]
                }
            }
        }
        catch (error) {
            req.body = {};
        }
        callback();
    });
}