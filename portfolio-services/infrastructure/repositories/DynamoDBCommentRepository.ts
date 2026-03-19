// External Dependencies:
import { DynamoDB } from 'aws-sdk';

// Internal Dependencies:
import {
  ICommentRepository,
  CreateCommentInput,
} from '../../application/interfaces/ICommentRepository';
import { Comment } from '../../domain/entities/comment/Comment';

const isOffline: boolean = process.env.IS_OFFLINE === 'true';

let dynamoDb: DynamoDB.DocumentClient;

if (isOffline) {
  dynamoDb = new DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  });
} else {
  dynamoDb = new DynamoDB.DocumentClient();
}

const TABLE_NAME = process.env.PORTFOLIO_COMMENTS_TABLE || 'PortfolioComments';

export class DynamoDBCommentRepository implements ICommentRepository {
  async getAllComments(): Promise<Comment[]> {
    const result = await dynamoDb.scan({ TableName: TABLE_NAME }).promise();

    const comments = (result.Items || []) as Comment[];
    return comments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const createdAt = new Date().toISOString();
    const item: Comment = {
      commentId: String(input.commentId),
      username: input.username || 'Anonymous',
      content: input.content,
      date: input.date || new Date().toLocaleDateString(),
      createdAt,
    };

    await dynamoDb.put({ TableName: TABLE_NAME, Item: item }).promise();

    return item;
  }
}
