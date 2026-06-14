import { Routes } from '@angular/router';
import { AccountComponent } from './pages/account/account';
import { BlogComponent } from './pages/blog/blog';
import { BuyComponent } from './pages/buy/buy';
import { ContactComponent } from './pages/contact/contact';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { MyListingsComponent } from './pages/my-listings/my-listings';
import { PackagesComponent } from './pages/packages/packages';
import { PostPropertyComponent } from './pages/post-property/post-property';
import { ProjectDetailRedirectComponent, ProjectsComponent } from './pages/projects/projects';
import { PropertyDetailComponent } from './pages/property-detail/property-detail';
import { RegisterComponent } from './pages/register/register';
import { RentComponent } from './pages/rent/rent';
import { authGuard, packageGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'buy', component: BuyComponent },
  { path: 'rent', component: RentComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailRedirectComponent },
  { path: 'property/:id', component: PropertyDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'packages', component: PackagesComponent },
  { path: 'post-property', component: PostPropertyComponent, canActivate: [authGuard, packageGuard] },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },
  { path: 'my-listings', component: MyListingsComponent, canActivate: [authGuard] },
  { path: 'blog', component: BlogComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];
