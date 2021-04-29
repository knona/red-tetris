import { Module } from '@nestjs/common';
import { EventsModule } from './modules/events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    EventsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'build')
    })
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
