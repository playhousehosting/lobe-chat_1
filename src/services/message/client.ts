import dayjs from 'dayjs';

import { FileModel } from '@/database/_deprecated/models/file';
import { clientDB } from '@/database/client/db';
import { MessageItem } from '@/database/schemas';
import { MessageModel } from '@/database/server/models/message';
import { TopicModel } from '@/database/server/models/topic';
import {
  ChatFileItem,
  ChatMessage,
  ChatMessageError,
  ChatTTS,
  ChatTranslate,
  CreateMessageParams,
} from '@/types/message';

import { IMessageService } from './type';

export class ClientService implements IMessageService {
  private topicModel: TopicModel;
  private messageModel: MessageModel;

  constructor(userId: string) {
    this.topicModel = new TopicModel(clientDB as any, userId);
    this.messageModel = new MessageModel(clientDB as any, userId);
  }

  async createMessage(data: CreateMessageParams) {
    const { id } = await this.messageModel.create(data);

    return id;
  }

  async batchCreateMessages(messages: MessageItem[]) {
    return this.messageModel.batchCreate(messages);
  }

  async getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]> {
    const messages = await this.messageModel.query({ sessionId, topicId });

    const fileList = (await Promise.all(
      messages
        .flatMap((item) => item.files)
        .filter(Boolean)
        .map(async (id) => FileModel.findById(id!)),
    )) as ChatFileItem[];

    return messages.map((item) => ({
      ...item,
      imageList: fileList
        .filter((file) => item.files?.includes(file.id) && file.fileType.startsWith('image'))
        .map((file) => ({
          alt: file.name,
          id: file.id,
          url: file.url,
        })),
    }));
  }

  async getAllMessages() {
    return this.messageModel.queryAll();
  }

  async countMessages() {
    return this.messageModel.count();
  }

  async countTodayMessages() {
    const topics = await this.messageModel.queryAll();
    return topics.filter(
      (item) => dayjs(item.createdAt).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    ).length;
  }

  async getAllMessagesInSession(sessionId: string) {
    return this.messageModel.queryBySessionId(sessionId);
  }

  async updateMessageError(id: string, error: ChatMessageError) {
    return this.messageModel.update(id, { error });
  }

  async updateMessage(id: string, message: Partial<MessageItem>) {
    return this.messageModel.update(id, message);
  }

  async updateMessageTTS(id: string, tts: Partial<ChatTTS> | false) {
    return this.messageModel.updateTTS(id, tts);
  }

  async updateMessageTranslate(id: string, translate: Partial<ChatTranslate> | false) {
    return this.messageModel.updateTranslate(id, translate);
  }

  async updateMessagePluginState(id: string, value: Record<string, any>) {
    return this.messageModel.updatePluginState(id, value);
  }

  async updateMessagePluginArguments(id: string, value: string | Record<string, any>) {
    const args = typeof value === 'string' ? value : JSON.stringify(value);

    return this.messageModel.updateMessagePlugin(id, { arguments: args });
  }

  async removeMessage(id: string) {
    return this.messageModel.deleteMessage(id);
  }

  async removeMessages(ids: string[]) {
    return this.messageModel.deleteMessages(ids);
  }

  async removeMessagesByAssistant(assistantId: string, topicId?: string) {
    return this.messageModel.deleteMessagesBySession(assistantId, topicId);
  }

  async removeAllMessages() {
    return this.messageModel.deleteAllMessages();
  }

  async hasMessages() {
    const number = await this.countMessages();
    return number > 0;
  }
}
