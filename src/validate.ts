import { VALIDATOR_URL } from "./globals";

export interface ValidationResult {
    data: string;
}

export async function validateNotification(data: string) : Promise<ValidationResult> {
    try {
        const response = await fetch(VALIDATOR_URL, {
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
    catch (e) {
        throw new Error(`Failed to contact ${VALIDATOR_URL}`);
    }
}