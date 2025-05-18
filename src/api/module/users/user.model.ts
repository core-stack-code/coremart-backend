import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    provider: 'local' | 'github';
    oauthId?: string | null;

    comparePassword(candidatePassword: string): Promise<boolean>;
}


const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    provider: { type: String, enum: ['local', 'github'], default: 'local' },
    oauthId: { type: String },
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model<IUser>('User', userSchema);

export default User;
