import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';



@Global()
@Module({
  imports: [],
  providers: [{
    provide: DataSource,
    inject: [],
    useFactory: async () => {
      try {
        const dataSource = new DataSource({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'myuser',
          password: 'mypassword',
          database: 'mydatabase',
          synchronize: true,
          entities: [__dirname+ '/dist/../../**/**.entity{.ts,.js}'],
        });
        await dataSource.initialize();
        console.log('Database connected successfully');
        return dataSource;
      } catch (error) {
        console.log('Error connecting to database');
        throw error;
      }
    }
  }],
  exports: [DataSource]
})
export class DataSourceModule {}
