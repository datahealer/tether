import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.DATABASE_URL;

        if (!mongoUri) {
            throw new Error('DATABASE_URL environment variable is not defined');
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
};

export default connectDB;