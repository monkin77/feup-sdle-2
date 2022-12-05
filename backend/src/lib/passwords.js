import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt with constant salt
 * @param {*} pass Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (pass) => {
    return await bcrypt.hash(pass, 10);
};

/**
 * Compares a password with a hashed password
 * @param {*} pass
 * @param {*} hash
 * @returns true if the password is correct, false otherwise
 */
export const comparePassword = async (pass, hash) => {
    return await bcrypt.compare(pass, hash);
};
