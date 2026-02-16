import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async startConversation(@Request() req: any, @Body('listingId') listingId: string) {
    return this.chatService.startConversation(req.user.userId, listingId);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.userId);
  }

  @Get('conversations/:id')
  async getConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversation(req.user.userId, id);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getMessages(req.user.userId, id);
  }

  @Post('conversations/:id/messages')
  async sendMessage(@Request() req: any, @Param('id') id: string, @Body('content') content: string) {
    return this.chatService.sendMessage(req.user.userId, id, content);
  }

  @Get('admin/conversations')
  async getAllConversations(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
    return this.chatService.getAllConversations();
  }

  @Get('admin/conversations/:id/messages')
  async getAdminMessages(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
    return this.chatService.getAdminMessages(id);
  }

  @Delete('admin/messages/:id')
  async deleteMessage(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
    return this.chatService.deleteMessage(id);
  }
}

