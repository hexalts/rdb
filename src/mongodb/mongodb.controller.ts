import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { MongodbService } from './mongodb.service';
import { filterParser } from './mongodb.utils';
import { PayloadProps } from './types';

@Controller('')
export class MongodbController {
  constructor(private readonly mongodbService: MongodbService) {}
  private mongo = this.mongodbService.mongo;

  @Post('create/:db/:coll')
  async create(
    @Body()
    body: PayloadProps,
    @Param('db') db: string,
    @Param('coll') coll: string,
  ) {
    try {
      const target = this.mongo.db(db).collection(coll);
      const { payload } = body;
      const isMany = Array.isArray(payload);
      const response = isMany
        ? await target.insertMany(payload)
        : await target.insertOne(payload);
      return response;
    } catch (error) {
      Logger.error(error);
    }
  }

  @Get('get/:db/:coll')
  async get(
    @Body()
    body: PayloadProps,
    @Param('db') db: string,
    @Param('coll') coll: string,
  ) {
    try {
      const target = this.mongo.db(db).collection(coll);
      const { query } = body;
      const filters = filterParser(query);
      const response = await target.find(filters).toArray();
      return response;
    } catch (error) {
      Logger.error(error);
    }
  }

  @Put('update/:db/:coll')
  async update(
    @Body()
    body: PayloadProps,
    @Param('db') db: string,
    @Param('coll') coll: string,
  ) {
    try {
      const target = this.mongo.db(db).collection(coll);
      const { query, payload } = body;
      const filters = filterParser(query);
      const response = await target.updateMany(filters, {
        // cast to object since it must be an object typed variable.
        // mongodb should throw error if the $set payload is not
        // an object.
        $set: payload as {},
      });
      return response;
    } catch (error) {
      Logger.error(error);
    }
  }

  @Delete('delete/:db/:coll')
  async delete(
    @Body()
    body: PayloadProps,
    @Param('db') db: string,
    @Param('coll') coll: string,
  ) {
    try {
      const target = this.mongo.db(db).collection(coll);
      const { query } = body;
      const filters = filterParser(query);
      const response = await target.deleteMany(filters);
      return response;
    } catch (error) {
      Logger.error(error);
    }
  }
}
