export const err: any = {
    "ENOENT": {
        "errno": -2,
        "code": "ENOENT",
        "description": "No such file or directory",
        "status": 404
    },
    "FileNotFound": {
        "errno": -4058,
        "code": "ENOENT",
        "description": "File not found",
        "status": 404
    },
    "CannotResolveModule": {
        "errno": -4048,
        "code": "ENOENT",
        "description": "Cannot resolve module",
        "status": 500
    },
    "UnableToResolveModule": {
        "errno": -4082,
        "code": "ENOENT",
        "description": "Unable to resolve module"
    },
    "UnknownResource": {
        "errno": -8000,
        "status": 503,
        "code": "ENOENT",
        "description": "Unknown resource"
    }
}

export async function _retry(callback: () => void) {
    try {
        await callback();
        return await { success: true }
    }
    catch (error: any) {
        // console.log(error)
        const get: { status: number, description: string } = err[error?.code];
        return await { success: false, err: error, status: get?.status }
    }
}