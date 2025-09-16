import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './category.dto';
import { RequestWithUser } from '../../common/types/request-with-user';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('categories')
@ApiBearerAuth('access-token')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiQuery({ name: 'with_titles', required: false, type: Boolean })
  @ApiQuery({ name: 'catalog', required: true, type: Boolean })
  async get(
    @Req() req: RequestWithUser,
    @Query('with_titles') with_titles?: boolean,
    @Query('catalog') catalog: boolean = true,
  ) {
    const lang = req.lang;
    const categories = await this.categoryService.get(
      lang,
      catalog,
      with_titles,
    );
    return plainToInstance(CategoryResponseDto, categories);
  }
}
