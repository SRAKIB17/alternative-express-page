const fileType = '.ts'; // Example: The file type extension to be removed

// Example usage:
const filePath = 'example/path/to/file.tsx';
const newPath = removeFileType(filePath, fileType);

console.log(newPath); // Output: example/path/to/file

function removeFileType(filePath, fileType) {
    if (filePath.endsWith(fileType)) {
        return filePath.slice(0, -fileType.length);
    }
    return filePath;
}
