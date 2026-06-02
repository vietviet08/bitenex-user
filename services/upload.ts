import { api } from "./api";

export async function uploadFile(
    fileUri: string,
    folder: string = "general",
): Promise<string> {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    formData.append("file", {
        uri: fileUri,
        name: filename,
        type,
    } as any);
    
    formData.append("folder", folder);

    const response = await api.post<{ url: string }>(
        "/upload/file",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );
    return response.data.url;
}
