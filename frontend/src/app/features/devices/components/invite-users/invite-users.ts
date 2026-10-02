import { DatePipe } from "@angular/common";
import { Component, OnInit, Output, ChangeDetectorRef, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Loading } from "../../../../shared/components/loading/loading";
import { UsersService } from "../../../users/services/users";
import { User } from "../../../../shared/interfaces/user";

@Component({
  selector: 'app-invite-users',
  imports: [FormsModule, DatePipe, Loading],
  templateUrl: './invite-users.html',
  styleUrl: './invite-users.css',
})
export class InviteUsers implements OnInit {
  @Output() close = new EventEmitter<void>();

  searchValue: string = ''
  loading: boolean = false
  users: User[] = []
  filteredUsers: User[] = []

  constructor(
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() { this.loading = false }

  loadUsers() {
    this.loading = true;
    const searchValue = { searchValue: this.searchValue };
    this.usersService.getUsers(searchValue).subscribe({
      next: ({ responseData }: any) => {
        this.filteredUsers = responseData;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.filteredUsers = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeEvent() { this.close.emit() }
}