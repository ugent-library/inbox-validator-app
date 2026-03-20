import { Readable } from 'readable-stream';
import { rdfParser } from "rdf-parse";
import type { Quad } from "@rdfjs/types";

const LDP = 'http://www.w3.org/ns/ldp#';
const POSIX = 'http://www.w3.org/ns/posix/stat#';
const IANA = 'http://www.w3.org/ns/iana/media-types/';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

export interface Notification {
    data: any 
}

export interface Member {
    name: string;
    mimeType?: string; 
    size?: number;
    date?: string;
}

export async function getNotification(url: string) : Promise<Notification> {
    const response = await fetch(url);

    if (! response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();

    return {
        data: json
    } as Notification;
}

export async function listInbox(url: string) : Promise<Member[]> {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/ld+json, text/turtle;q=0.9'
        }
    });

    if (! response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? 'application/ld+json';

    let inbox : Member[];

    if (contentType.includes('application/ld+json')) {
        const text = await response.text();
        inbox = await parseInbox(text,'application/ld+json');
    }
    else if (contentType.includes('text/turtle')) {
        const text = await response.text();
        inbox = await parseInbox(text,'text/turtle');
    }
    else {
        throw new Error(`can not parse: ${contentType}`);
    }

    // Clean the members and remove the base url
    return inbox.map(member => ({
        ...member,
        name: member.name.replace(url,"")
    }));
}

async function parseInbox(data: string, type: string) : Promise<Member[]> {
    const quads = await parseRDF(data, type);
    const result : Member[] = [];

    for (let i = 0 ; i < quads.length ; i++) {
        if (quads[i].predicate.value === `${LDP}contains`) {
            result.push( {
                name: quads[i].object.value
            });
        }
    }

    for (let i = 0 ; i < quads.length ; i++) {
        const r  = result.find( res => res.name == quads[i].subject.value);

        if (r) {
            if (quads[i].predicate.value === `${POSIX}mtime`) {
                r.date = new Date(Number(quads[i].object.value) * 1000).toISOString();
            }
            if (quads[i].predicate.value === `${POSIX}size`) {
                r.size = Number(quads[i].object.value);
            }
            if (quads[i].predicate.value === `${RDF}type` &&
                quads[i].object.value.startsWith(IANA)
            ) {
                r.mimeType = quads[i].object.value
                                .replace(IANA,"")
                                .replaceAll(/#.*/g,'');
            }
        }
    }
    return result;
}

async function parseRDF(data: string, type: string) : Promise<Quad[]> {
    return new Promise<Quad[]>( (resolve,reject) => {
        const textStream = streamifyString(data);
        const quads : Quad[] = [];

        rdfParser.parse(textStream, { contentType: type })
            .on('data', (quad) => quads.push(quad))
            .on('error', (error) => reject(error))
            .on('end', () => resolve(quads));
    });
}

function streamifyString(data:string) {
    const stream = new Readable({
        read() {
            this.push(data);
            this.push(null); // Signals the end of the stream
        }
    });
    return stream;
}