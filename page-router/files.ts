import { accessSync, constants, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { Request, Response } from "../src";


export function getFiles(dirPath: string) {
    const filesInFolder = readdirSync(dirPath, { withFileTypes: true });
    return filesInFolder;
}
export function hasStaticFiles(pathname: string) {
    return new Promise<void>((resolve, reject) => {
        // fs.access(pathname, fs.constants.F_OK, (err) => {
        //     if (err) {
        //         this.notFoundHandler(req, res);
        //     } else {
        //         if (module) {
        //             this.#moduleHandler(pathname, req, res).then(() => resolve()).catch(reject);
        //         }
        //         else {
        //             const fileContentType = getFileContentType(pathname)?.type;
        //             if (moduleType.includes(fileContentType)) {
        //                 return this.notFoundHandler(req, res);
        //             }
        //             else {
        //                 this.#responseHandler(req, res, (req, res) => {
        //                     return res.sendFile(pathname);
        //                 });
        //             }
        //         }
        //     }
        // });
    });

}
export async function accessFile(filename: string, req: Request, res: Response, callback: () => void) {
    return accessSync(filename, constants.F_OK)
}

export function dirIsEmpty(path: string) {
    // if (!existsSync(path)) return true;
    // const dirData = readdirSync(path);
    // return dirData.length === 0;
}
export function fromFile(inputFileName: string) {
    return new Promise<string>((resolve, reject) => {
        resolve(readFileSync(inputFileName, { encoding: "utf-8" }));
    });
}
export async function getLocalFileContents(filepath: string) {
    return readFileSync(path.resolve(`./${filepath}`), {
        encoding: 'utf8',
    })
}

export function readdir(dirPath?: string): readonly string[] {
    return []
    // return readdirSync(this.getPath(dirPath))
    //     .sort()
    //     .filter(name => name !== ".DS_Store");
}
//      getFiles(srcpath: string): string[] {
//     // return fs
//     //     .readdirSync(srcpath)
//     //     .filter((file) => fs.statSync(path.join(srcpath, file)).isFile());
// }
export function assertEmptyDir(path: string): void {
    // if (readdirSync(this.parse(path)).length > 0) {
    //     throw new Error(`The directory "${path}" should be empty.`);
    // }
}
export function prepare(dirPath: string) {
    for (const file of readdirSync(dirPath).filter(f => f.endsWith('.js') && f !== 'index.js')) {
        // api.suite(file, () => require(`./${file}`).default(api));
        console.log(file)
    }
}
export function* walkSync(dir: string): Generator<string> {
    const files = readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield path.join(dir, file.name);
        }
    }
}
export function findPackagesUnderPath(path: string) {
    const searchPaths = [path];
    const packages: string[] = [];
    // while (searchPaths.length > 0) {
    //     const search = searchPaths.shift()!;
    //     if (await util.promisify(fs.exists)(`${search}/package.json`)) {
    //         packages.push(search);
    //     } else {
    //         searchPaths.push(
    //             ...fs.readdirSync(search, { withFileTypes: true })
    //                 .filter((t) => t.isDirectory())
    //                 .map((d) => `${search}/${d.name}`));
    //     }
    // }
    return packages;
}
export function getFolders(dirPath: string) {
    return readdirSync(dirPath)
        .filter(function (file) {
            return statSync(path.join(dirPath, file)).isDirectory();
        }).map((folder: any) => `${path}/${folder.name}`);
}
export function getConflictsForDirectory(projectRoot: string): string[] {
    return []
    // return readdirSync(projectRoot).filter(
    //     true
    //     // (file: string) => !(/\.iml$/.test(file) || tolerableFiles.includes(file))
    // );
}
export async function getConflictsForFile(pathname: string): Promise<string[]> {
    return readdirSync(pathname)
    //     .filter(
    // //     true
    // //     // (file: string) => !(/\.iml$/.test(file) || tolerableFiles.includes(file))
    // // );

}
export function getDirectories(dirPath: string): string[] {
    return readdirSync(dirPath)
        .map((name: string): string => path.join(dirPath, name))
    // .filter(this.isDirectory);
}
export function getStaticFiles(srcpath: string): string[] {
    return readdirSync(srcpath).filter((file) => statSync(path.join(srcpath, file)).isFile());
}

export function findMiddlewareFiles(dir: string): string[] {
    let middlewareFiles: string[] = [];
    // Get all files and directories in the current directory
    const items = readdirSync(dir);
    console.log(items)
    // Iterate over each item
    items.forEach(item => {
        // Get the full path of the item
        const itemPath = path.join(dir, item);

        // Check if the item is a directory
        if (statSync(itemPath).isDirectory()) {
            // Recursively call findMiddlewareFiles for subdirectories
            middlewareFiles = middlewareFiles.concat(findMiddlewareFiles(itemPath));
        }
        else {
            // Check if the item is a middleware file (you can adjust the condition as needed)
            if (item.endsWith('.ts') && item.includes('middleware')) {
                middlewareFiles.push(itemPath);
            }
        }
    });
    return middlewareFiles;
}
