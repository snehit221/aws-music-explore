import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header-search',
  standalone: true,
  imports: [MatButtonModule, MatToolbarModule, MatIconModule, MatInputModule, MatMenuModule, CommonModule, FormsModule],
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.css'
})
export class HeaderSearchComponent {

  @Output() searchResult = new EventEmitter<any>();
  searchText!: string;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location) { }
  
  isSmallScreen: boolean = false;

  search():void{
    if(this.searchText)
    console.log("inside search function...", this.searchText)
    this.router.navigateByUrl('/search/' + this.searchText);
    this.location.replaceState('/search/' + this.searchText);

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 768;
    }
  }


}
