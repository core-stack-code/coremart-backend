import bcrypt from 'bcrypt';

export const generatePasswordHash = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(8);
    return await bcrypt.hash(password, salt);
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}