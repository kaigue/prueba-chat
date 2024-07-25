import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { ChatsService } from 'src/app/services/chats.service';
import { UsersResponse } from 'src/app/interfaces/usersReponse';
import { filter } from 'rxjs/operators';
import { GroupsByUserResponse } from 'src/app/interfaces/groupsByUserResponse';
import { Data } from '../../interfaces/loginResponse';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  open_new_chat = false;
  id: string | null;
  users: UsersResponse[] = []; // Crear una nueva variable para almacenar usuarios
  groups: GroupsByUserResponse[] = [];


  constructor(
    private router: Router,
    private serviceChat: ChatsService,
    private modalController: ModalController,
    private popoverController: PopoverController
  ) { 
    this.id = localStorage.getItem('id');
    console.log('usuario: ' + this.id);
  }

  ngOnInit() {
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (this.router.url === '/home') {
        this.getUsuarios();
        this.getGroups();
      }
    });
  }

  // ionViewWillEnter() {
  //   this.getUsuarios();
  // }

  logout() {
    this.popoverController.dismiss();
    localStorage.removeItem('id');
    console.log('ID después del logout:', localStorage.getItem('id')); // Verificar que se eliminó el ID
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  newChat() {
    this.open_new_chat = true;
  }

  onWillDismiss(event: any) {}

  cancel() {
    this.modalController.dismiss();
    this.open_new_chat = false;
  }

  startChat(event: any) {}

  getChat(item: any) {
    this.router.navigate(['/chat', item?.id]);
  }

  getUsuarios() {
    this.serviceChat.getUsers().subscribe(
      data => {
        this.users = data.filter(user => user.id !== Number(this.id));
        console.log(this.users);
      },
      error => {
        console.error('Error al conseguir usuarios', error);
      }
    );
  }
  
  getGroups(){
    this.serviceChat.getGroupsbyUser(Number(this.id)).subscribe(
      data => {
        this.groups = data;
        this.groups.forEach(group =>{
          console.log('Grupo: ' + group.group_id);
        });
        
      },
      error => {
        console.error('Error al conseguir grupos', error);
      }
    );
  }

  getGroupChat(group: any){
    this.router.navigate(['/group-chat', group?.group_id]);
  }

}
