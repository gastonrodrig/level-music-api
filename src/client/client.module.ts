import { Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { ClientController } from './controllers/client.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './schema/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema }
    ])
  ],
  providers: [ClientService],
  controllers: [ClientController]
})
export class ClientModule {}
