import fs from "fs";

export function getFileContentType(fileName: string): { contentType: string; mimeType: string, type: string } {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
        case 'txt':
            return { contentType: 'text/plain', mimeType: 'text/plain', type: fileExtension };
        case 'jpg':
        case 'jpeg':
            return { contentType: 'image/jpeg', mimeType: 'image/jpeg', type: fileExtension };
        case 'png':
            return { contentType: 'image/png', mimeType: 'image/png', type: fileExtension };
        case 'gif':
            return { contentType: 'image/gif', mimeType: 'image/gif', type: fileExtension };
        case 'pdf':
            return { contentType: 'application/pdf', mimeType: 'application/pdf', type: fileExtension };
        case 'ts':
            return { contentType: 'text/typescript', mimeType: 'text/typescript', type: fileExtension };
        case 'js':
            return { contentType: 'application/javascript', mimeType: 'application/javascript', type: fileExtension };
        default:
            return { contentType: 'application/octet-stream', mimeType: 'unknown', type: "unknown" };
    }
}
export const moduleType = ['js', 'ts'];
export function isModuleFile(filePath: string): boolean {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileExtension = getFileContentType(filePath);
    // Check if file contains module-related syntax
    const isModuleSyntaxPresent = /(import|export|export\s*\{)/.test(fileContent);
    // Check if file extension indicates it's a module file
    const isModuleFileExtension = moduleType.includes(fileExtension?.type);
    return isModuleSyntaxPresent && isModuleFileExtension;
}