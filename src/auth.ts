import crypto from "node:crypto";

// Salt + hash the password
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === hashToVerify; // Compare the stored hash with the new hash
}

export function generateToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

/** A valid username will return undefined.
 * An invalid username will return a string of why.
 */
export function usernameInvalid(username: string): string | undefined {
    if (username === '') return 'Username required';
    if (username.length > 40) return 'Username must be less that 40 characters';
    const validCharacterRegex = /^[a-z0-9_]+$/;
    if (!validCharacterRegex.test(username)) return "Username must only contain lower case letters, numbers or '_'"
    //TODO probably need a bad word list..
}

/** A valid password will return undefined.
 * An invalid password will return a string of why.
 */
export function passwordInvalid(password: string): string | undefined {
    if (password.length < 8) return 'Password too short';
    if (password.length > 100) return 'Password must be less than 100 characters';
}