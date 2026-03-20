const VALIDATOR = 'http://localhost:3000/validate';

export interface ValidationResult {
    data: string;
}

export async function validateNotification(data: string) : Promise<ValidationResult> {
    const response = await fetch(VALIDATOR, {
        method: "POST",
        body: data
    });

    if (! response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();

    return {
        data: json.result
    } as ValidationResult;
}