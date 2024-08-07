export const err: any = {
    "CONFLICT": {
        "title": "Conflict: Duplicate filenames detected",
        "status": 409,
        "link": "",
        "explain": `
    <h2 style="font-weight: bold;">Explanation:</h2>
        <p>
            Both filenames were found in the directory, and they are
            considered conflicting because they have similar names. This might cause ambiguity when resolving file
            references.
        </p>
    `,
        resolution: `
        <h2 style="font-weight: bold;">Resolution:</h2>
        <ol>
            <li>Rename one of the files to have a distinct name, ensuring clarity and avoiding ambiguity.</li>
            <li>If both files serve different purposes or belong to different parts of the application, consider
                organizing them into separate directories.</li>
            <li>If the files are intended to be alternative implementations for different environments (e.g., TypeScript
                and JavaScript), ensure clear documentation to distinguish their usage.</li>
        </ol>
        `
    },
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

type errnoType = "CONFLICT";
type Msg = {
    status: number,
    type: errnoType,
    subtitle: [string, string]
}
export type ServerErrorType = {
    message: Msg
}

export const errorMsgHtmlGen = ({
    type,
    subtitle,
}: Msg) => {
    const getMassage = err[type];
    console.log()
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conflict Message</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            h1 {
                color: #333;
            }

            h2 {
                color: #555;
            }

            p {
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <h1 style="color: #ff0000; font-weight: bold;">
           ${getMassage?.title}
        </h1>
        <p>
            ${Boolean(subtitle?.length) && `<strong>${subtitle?.[0]}:</strong> ${subtitle?.[1]}`}
        </p>
      ${getMassage.explain}
      ${getMassage?.resolution}
    </body>
</html>
    `
}