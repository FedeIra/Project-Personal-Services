import { ICommentRepository } from '../interfaces/ICommentRepository';
import { Comment } from '../../domain/entities/comment/Comment';

export class GetCommentsUseCase {
  constructor(private readonly repository: ICommentRepository) {}

  async execute(): Promise<Comment[]> {
    return this.repository.getAllComments();
  }
}
