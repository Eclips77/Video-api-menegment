import createHttpError from 'http-errors';
import express from 'express';

const hasDuplicateKeys = (rawBody) => {
    const stack = [];
    const keysStack = [];
    let inString = false;
    let inKey = false;
    let key = '';

    for (let i = 0; i < rawBody.length; i++) {
        const char = rawBody[i];

        if (char === '"') {
            inString = !inString;
            if (inKey) {
                if (keysStack[keysStack.length - 1].has(key)) {
                    return true;
                }
                keysStack[keysStack.length - 1].add(key);
                key = '';
            }
            inKey = !inKey;
            continue;
        }

        if (inString && inKey) {
            key += char;
        }

        if (!inString) {
            if (char === '{') {
                stack.push('{');
                keysStack.push(new Set());
            } else if (char === '}') {
                stack.pop();
                keysStack.pop();
            }
        }
    }
    return false;
};


const duplicateKeyCheckMiddleware = express.raw({
    type: 'application/json',
    verify: (req, res, buf) => {
        const rawBody = buf.toString();
        if (hasDuplicateKeys(rawBody)) {
            throw createHttpError(400, 'Duplicate keys are not allowed in JSON body.');
        }
    }
});

export default duplicateKeyCheckMiddleware;
