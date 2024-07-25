import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatsService } from 'src/app/services/chats.service';
import { MessagesByUserResponse } from 'src/app/interfaces/messagesByUserResponse';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  receiver: string = '';
  message!: string;
  isLoading = false;
  currentUserId: number; // Cambiar a número
  receiverId: number;
  chats: MessagesByUserResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatsService
  ) {
    // Obtener el ID del receptor de los parámetros de la ruta
    this.receiverId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    // Convertir currentUserId a número
    this.currentUserId = Number(localStorage.getItem('id')) || 0;
  }

  ngOnInit() {
    console.log("Emisor en chat: " + this.currentUserId);
    console.log("Receptor en chat: " + this.receiverId);
    this.loadReceiverName();
    this.loadMessages();
  }

  loadMessages() {
    if (this.currentUserId && this.receiverId) {
      // Obtener mensajes de currentUserId a receiverId
      this.chatService.getMessageByUser(this.currentUserId, this.receiverId).subscribe(
        data1 => {
          // Obtener mensajes de receiverId a currentUserId
          this.chatService.getMessageByUser(this.receiverId, this.currentUserId).subscribe(
            data2 => {
              // Combinar ambos conjuntos de mensajes
              this.chats = [...data1, ...data2];
              // Ordenar los mensajes por fecha y hora
              this.chats.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
              console.log(this.chats);
              this.scrollToBottom();
            },
            error => {
              console.error('Error fetching messages from receiver to sender', error);
            }
          );
        },
        error => {
          console.error('Error fetching messages from sender to receiver', error);
        }
      );
    }
  }

  loadReceiverName() {
    this.chatService.getUsers().subscribe(
      users => {
        const receiver = users.find(user => user.id === this.receiverId);
        if (receiver) {
          this.receiver = receiver.username;
        }
      },
      error => {
        console.error('Error fetching users', error);
      }
    );
  }

  sendMessage() {
    if (this.message.trim()) {
      this.isLoading = true;
      this.chatService.postPrivateMessage(this.currentUserId, this.receiverId, this.message).subscribe(
        response => {
          // Una vez enviado el mensaje, recarga los mensajes para incluir el nuevo
          this.loadMessages();
          // Resetea el campo de mensaje
          this.message = '';
          this.isLoading = false;
          this.scrollToBottom();
        },
        error => {
          console.error('Error sending message', error);
          this.isLoading = false;
        }
      );
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(200);
    }, 100);
  }
}
