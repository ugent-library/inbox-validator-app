export interface Member {
    name: string;
    mimeType?: string; 
    size?: number;
    date?: string;
}

export async function listInbox(url: string)  : Promise<Member[]> {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/ld+json, text/turtle;q=0.9'
            }
        });

        if (! response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type') ?? 'application/ld+json';

        const result = [
            { "name": "accept.jsonld"}
        ];

        if (contentType.includes('application/ld+json')) {
            const data = await response.json();
            return result;
        }
        else {
            const text = await response.text();
            return result;
        }
    }
    catch (error) {
        console.error(`fetch failed:`, error);
        return [];
    }
}