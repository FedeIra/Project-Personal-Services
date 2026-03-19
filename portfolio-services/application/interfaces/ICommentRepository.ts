import { Comment } from '../../domain/entities/comment/Comment';

export interface CreateCommentInput {
  commentId: string;
  username: string;
  content: string;
  date: string;
}

export interface ICommentRepository {
  getAllComments(): Promise<Comment[]>;
  createComment(input: CreateCommentInput): Promise<Comment>;
}
