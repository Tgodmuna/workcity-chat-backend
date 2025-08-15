import mongoose from 'mongoose';

const ConnectToDB = async (uri: string):Promise<void> => {
  mongoose.connection.on('open', () => {
    console.log('connection to database established');
  });
  mongoose.connection.once('connected', () =>
    console.log('Database connected successfully')
  );
  await mongoose.connect(uri);
};

export default ConnectToDB;
