import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from '../utils/prismaError';
import { PostNotFoundException } from './exceptions/postNotFound.exception';
import { User } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPost(post: CreatePostDto, user: User) {
    const categories = post.categoryIds?.map((category) => ({
      id: category,
    }));

    return this.prismaService.post.create({
      data: {
        title: post.title,
        content: post.content,
        author: {
          connect: {
            id: user.id,
          },
        },
        categories: {
          connect: categories,
        },
      },
      include: {
        categories: true,
      },
    });
  }

  async updatePost(id: number, post: UpdatePostDto) {
    try {
      return await this.prismaService.post.update({
        data: {
          ...post,
          id: undefined,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        throw new PostNotFoundException(id);
      }
      throw error;
    }
  }

  async deletePost(id: number) {
    try {
      return this.prismaService.post.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        throw new PostNotFoundException(id);
      }
      throw error;
    }
  }
}
