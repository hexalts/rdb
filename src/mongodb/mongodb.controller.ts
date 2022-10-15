import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { errorHandler } from 'src/utils/errors/handler';
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
      errorHandler(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      const filterResult = filterParser(query);
      const response = await target.find(filterResult).toArray();
      return response;
    } catch (error) {
      errorHandler(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      const filterResult = filterParser(query);
      const response = await target.updateMany(filterResult, {
        // cast to object since it must be an object typed variable.
        // mongodb should throw error if the $set payload is not
        // an object.
        $set: payload as Record<string, unknown>,
      });
      return response;
    } catch (error) {
      errorHandler(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      const filterResult = filterParser(query);
      const response = await target.deleteMany(filterResult);
      return response;
    } catch (error) {
      errorHandler(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
