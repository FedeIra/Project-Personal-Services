import {
  ICommentRepository,
  CreateCommentInput,
} from '../interfaces/ICommentRepository';
import { Comment } from '../../domain/entities/comment/Comment';

export class CreateCommentUseCase {
  constructor(private readonly repository: ICommentRepository) {}

  async execute(input: CreateCommentInput): Promise<Comment> {
    return this.repository.createComment(input);
  }
}
