import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt with constant salt
 * @param {*} pass Plain text password
 * @returns Hashed password 
 */
export const hashPassword = async(pass) => {
    return await bcrypt.hash(pass, 10);
};