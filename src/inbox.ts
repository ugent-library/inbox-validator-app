import { Readable } from 'readable-stream';
import { rdfParser } from "rdf-parse";
import type { Quad } from "@rdfjs/types";
import N3 from 'n3';

const AS = 'https://www.w3.org/ns/activitystreams#';
const LDP = 'http://www.w3.org/ns/ldp#';
const POSIX = 'http://www.w3.org/ns/posix/stat#';
const IANA = 'http://www.w3.org/ns/iana/media-types/';

export interface Agent {
    id: string;
    type: string;
    name: string | undefined;
    inbox: string | undefined;
}

export interface GenericObject {
    id?: string;
    type?: string[];
    inReplyTo?: string[];
    actor?: Agent;
    context?: GenericObject;
    origin?: Agent;
    object?: GenericObject;
    target?: Agent;
    summary?: string;
}

export interface Notification {
    data: string;
    object?: GenericObject;
    parseError: boolean;
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

    const text = await response.text();

    return parseNotification(text,"application/ld+json");
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

async function parseNotification(data: string, type: string) : Promise<Notification> {
    let notification : Notification = { data , parseError: false };

    try {
        const store = await parseRDF(data,type);

        const root = mainId(store);

        if (! root) {
            throw new Error(`no root id found in the data`);
        }

        notification.object = await parseNotificationObject(store,root);
    }
    catch (e) {
        console.log(e);
        notification.parseError = true;   
    }

    console.log(notification);

    return notification;
}

async function parseNotificationObject(store: N3.Store, id: string) : Promise<GenericObject> {
    const notification : GenericObject = { id };

    const engine = new window.Comunica.QueryEngine();
    const bindingsStream = await engine.queryBindings(
        `
        PREFIX as: <${AS}>
        PREFIX ldp: <${LDP}>
        SELECT 
            ?type ?inReplyTo 
            ?actor ?actorType ?actorName ?actorInbox
            ?origin ?originType ?originName ?originInbox
            ?object
            ?target ?targetType ?targetName ?targetInbox
            ?summary ?context
        WHERE {
            <${id}> a ?type
            OPTIONAL {
                <${id}> as:inReplyTo ?inReplyTo
            }
            OPTIONAL {
                <${id}> as:actor ?actor .
                ?actor a ?actorType .
                OPTIONAL {
                    ?actor as:name ?actorName .
                }
                OPTIONAL {
                    ?actor ldp:inbox ?actorInbox .
                }
            }
            OPTIONAL {
                <${id}> as:origin ?origin .
                ?origin a ?originType .
                OPTIONAL {
                    ?origin as:name ?originName .
                }
                OPTIONAL {
                    ?origin ldp:inbox ?originInbox .
                }
            }
            OPTIONAL {
                <${id}> as:target ?target .
                ?target a ?targetType .
                OPTIONAL {
                    ?target as:name ?targetName .
                }
                OPTIONAL {
                    ?target ldp:inbox ?targetInbox .
                }
            }
            OPTIONAL {
                <${id}> as:object ?object .
            }
            OPTIONAL {
                <${id}> as:context ?context .
            }
            OPTIONAL {
                <${id}> as:summary ?summary .
            }
        }
        `,
        {
            sources: [store]
        }
    );

    const bindings = await bindingsStream.toArray();

    if (bindings) {
        const typeSet   = new Set<string>();
        const replySet  = new Set<string>();
        let actor       = "";
        let actorType   = "";
        let actorName;
        let actorInbox;
        let origin      = "";
        let originType  = "";
        let originName;
        let originInbox;
        let object;
        let target      = "";
        let targetType  = "";
        let targetName;
        let targetInbox;
        let summary;
        let context;

        for (let i = 0 ; i < bindings.length ; i++) {
                if (bindings[i]?.get('type')) {
                    typeSet.add(bindings[i]?.get('type').value);
                }
                if (bindings[i]?.get('inReplyTo')) {
                    replySet.add(bindings[i]?.get('inReplyTo').value);
                }
                if (bindings[i]?.get('actor')) {
                    actor = bindings[i]?.get('actor').value;
                }
                if (bindings[i]?.get('actorType')) {
                    actorType = bindings[i]?.get('actorType').value;
                }
                if (bindings[i]?.get('actorName')) {
                    actorName = bindings[i]?.get('actorName').value;
                }
                if (bindings[i]?.get('actorInbox')) {
                    actorInbox = bindings[i]?.get('actorInbox').value;
                }
                if (bindings[i]?.get('origin')) {
                    origin = bindings[i]?.get('origin').value;
                }
                if (bindings[i]?.get('originType')) {
                    originType = bindings[i]?.get('originType').value;
                }
                if (bindings[i]?.get('originName')) {
                    originName = bindings[i]?.get('originName').value;
                }
                if (bindings[i]?.get('originInbox')) {
                    originInbox = bindings[i]?.get('originInbox').value;
                }
                if (bindings[i]?.get('object')) {
                    object = bindings[i]?.get('object').value;
                } 
                if (bindings[i]?.get('target')) {
                    target = bindings[i]?.get('target').value;
                }
                if (bindings[i]?.get('targetType')) {
                    targetType = bindings[i]?.get('targetType').value;
                }
                if (bindings[i]?.get('targetName')) {
                    targetName = bindings[i]?.get('targetName').value;
                }
                if (bindings[i]?.get('targetInbox')) {
                    targetInbox = bindings[i]?.get('targetInbox').value;
                }
                if (bindings[i]?.get('summary')) {
                    summary = bindings[i]?.get('summary').value;
                }
                if (bindings[i]?.get('context')) {
                    summary = bindings[i]?.get('context').value;
                }
        }

        notification.type = [...typeSet];

        if (replySet.size) {
            notification.inReplyTo = [...replySet];
        }

        if (actor) {
            notification.actor = {
                id: actor,
                type: actorType,
                name: actorName,
                inbox: actorInbox
            };
        }

        if (origin) {
            notification.origin = {
                id: origin,
                type: originType,
                name: originName,
                inbox: originInbox
            };
        }

        if (object) {
            notification.object = await parseNotificationObject(store,object);
        }

        if (target) {
            notification.target = {
                id: target,
                type: targetType,
                name: targetName,
                inbox: targetInbox
            };
        }

        if (summary) {
            notification.summary = summary;
        }

        if (context) {
            notification.context = await parseNotificationObject(store,context);
        }
    }

    return notification;
}

async function parseInbox(data: string, type: string) : Promise<Member[]> {
    try {
        const store = await parseRDF(data, type);
        const result : Member[] = [];

        const engine = new window.Comunica.QueryEngine();
        const bindingsStream = await engine.queryBindings(
            `
            PREFIX ldp: <${LDP}>
            PREFIX posix: <${POSIX}>

            SELECT ?name ?mtime ?size ?type WHERE {
                ?s ldp:contains ?name .
                OPTIONAL {
                    ?name a ?type .
                    FILTER(STRSTARTS(STR(?type), "${IANA}"))
                }
                OPTIONAL {
                    ?name posix:mtime ?mtime .
                }
                OPTIONAL {
                    ?name posix:size ?size .
                }
            }
            `,
            {
            sources: [store]
            }
        );

        const bindings = await bindingsStream.toArray();
        
        if (bindings) {
            for (let i = 0 ; i < bindings.length ; i++) {
                const member : Member = { "name": ""};
                if (bindings[i]?.get('name')) {
                    member.name = bindings[i]?.get('name').value;
                }
                if (bindings[i]?.get('mtime')) {
                    member.date = new Date(Number(bindings[i]?.get('mtime').value)*1000).toISOString();
                }
                if (bindings[i]?.get('size')) {
                    member.size = bindings[i]?.get('size').value;
                }
                if (bindings[i]?.get('type')) {
                    member.mimeType = bindings[i]?.get('type').value
                                        .replace(IANA,"")
                                        .replaceAll(/#.*/g,'');
                }
                result.push(member);
            }
        }   

        return result;
    }
    catch (e: unknown) {
        console.log(e);
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        else {
            throw new Error(`Unknown parsing error: ${e}`);
        }
    }
}

function mainId(store: N3.Store) : string | null {
    const subjectSet = new Set<string>();
    const objectSet  = new Set<string>();

    store.forEach( (quad: Quad) => {
        subjectSet.add(quad.subject.value);
        if (quad.object.termType !== "Literal") {
            objectSet.add(quad.object.value);
        }
    }, null, null, null, null);

    const diff = new Set([...subjectSet].filter(item => !objectSet.has(item)));

    if (diff.size == 1) {
        const val = diff.values().next().value;
        return val ? val : null;
    }
    else {
        return null;
    }
}

async function parseRDF(data: string, type: string) : Promise<N3.Store> {
    return new Promise<N3.Store>( (resolve,reject) => {
        const textStream = streamifyString(data);
        const store = new N3.Store();
        
        rdfParser.parse(textStream, { contentType: type })
            .on('data', (quad) => store.add(quad))
            .on('error', (error) => reject(error))
            .on('end', () => resolve(store));
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