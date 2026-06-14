import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Blog, Project, Property } from '../../core/models';
import { DataService } from '../../core/services/data.service';
import { ButtonComponent } from '../../shared/components/button/button';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBoxComponent, PropertyCardComponent, ButtonComponent],
  template: `
    <main>
      <section class="hero">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="eyebrow">Condo Finder | ชี้เป้าคอนโดเด็ด</p>
          <h1><span>ค้นหาคอนโดที่ใช่</span><span>ในทำเลที่คุณต้องการ</span></h1>
          <p class="lead"><span>รวมประกาศขายและให้เช่าคอนโดคุณภาพ</span><span>ค้นหาง่าย เปรียบเทียบสะดวก</span><span>พร้อมข้อมูลครบก่อนตัดสินใจ</span></p>
          <app-search-box></app-search-box>
        </div>
      </section>

      <section class="stats-band">
        <div class="stats-grid">
          <div *ngFor="let stat of stats">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section class="section white-section">
        <div class="section-heading split">
          <div>
            <p class="eyebrow teal">Featured Listings</p>
            <h2>ประกาศคอนโดแนะนำ</h2>
            <p>คัดรายการเด่นจากทำเลยอดนิยม ทั้งคอนโดขายและคอนโดให้เช่า</p>
          </div>
          <app-button href="/buy" variant="outline">ดูประกาศทั้งหมด</app-button>
        </div>
        <div class="listing-grid">
          <app-property-card *ngFor="let property of featuredProperties" [property]="property"></app-property-card>
        </div>
      </section>

      <section class="section muted-section">
        <div class="section-heading center">
          <p class="eyebrow teal">Popular Locations</p>
          <h2>ทำเลยอดนิยม</h2>
          <p>เลือกดูคอนโดตามย่านที่คนค้นหาบ่อย พร้อมจำนวนประกาศในแต่ละทำเล</p>
        </div>
        <div class="location-grid">
          <a *ngFor="let location of popularLocations" [routerLink]="['/buy']" [queryParams]="{ location: location.name }" class="location-card">
            <img [src]="location.image" [alt]="location.name" />
            <span class="shade"></span>
            <span class="location-text">
              <strong>{{ location.name }}</strong>
              <small>{{ location.count }} ประกาศ</small>
            </span>
          </a>
        </div>
      </section>

      <section class="section white-section project-layout">
        <div>
          <p class="eyebrow teal">New Condo Projects</p>
          <h2>โครงการคอนโดใหม่</h2>
          <p class="section-copy">รวมโครงการใหม่และโครงการพร้อมอยู่จาก Developer ชั้นนำ</p>
          <div class="project-list">
            <a *ngFor="let project of projects" [routerLink]="['/projects', project.id]" class="project-card">
              <img [src]="project.image" [alt]="project.name" />
              <span>
                <strong>{{ project.name }}</strong>
                <small>{{ project.developer }} | {{ project.location }}</small>
                <b>เริ่ม {{ project.startingPrice | number }} บาท</b>
              </span>
            </a>
          </div>
        </div>

        <aside class="why-panel">
          <p class="eyebrow teal">Why Condo Finder</p>
          <h2>ทำไมต้องเลือกเรา</h2>
          <div class="why-list">
            <div *ngFor="let item of whyChoose">
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </aside>
      </section>

      <section class="section muted-section">
        <div class="section-heading split">
          <div>
            <p class="eyebrow teal">Articles</p>
            <h2>บทความล่าสุด</h2>
            <p>คู่มือสำหรับคนซื้อ ขาย เช่า และลงทุนคอนโด</p>
          </div>
          <app-button href="/blog" variant="outline">อ่านทั้งหมด</app-button>
        </div>
        <div class="blog-grid">
          <a *ngFor="let blog of blogs" routerLink="/blog" class="blog-card">
            <img [src]="blog.image" [alt]="blog.title" />
            <span>
              <small>{{ blog.category }}</small>
              <strong>{{ blog.title }}</strong>
              <p>{{ blog.excerpt }}</p>
            </span>
          </a>
        </div>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .hero {
      background-image: url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1800&q=80');
      background-position: center;
      background-size: cover;
      min-height: 680px;
      overflow: visible;
      position: relative;
      z-index: 4;
    }
    .hero-overlay {
      background: linear-gradient(180deg, rgba(7, 59, 58, 0.82), rgba(7, 59, 58, 0.54) 52%, #f7faf9 100%);
      inset: 0;
      position: absolute;
    }
    .hero-content {
      color: #fff;
      margin: 0 auto;
      max-width: 1120px;
      padding: 118px 24px 126px;
      position: relative;
      text-align: center;
      z-index: 6;
    }
    .eyebrow {
      color: #d8b95a;
      font-weight: 900;
      letter-spacing: 0;
      margin: 0 0 14px;
    }
    .eyebrow.teal {
      color: #0b6f6f;
    }
    h1 {
      display: grid;
      font-size: clamp(2.1rem, 5.2vw, 4.85rem);
      gap: 18px;
      line-height: 1.2;
      margin: 0 auto;
      max-width: 900px;
      overflow-wrap: anywhere;
    }
    h1 span,
    .lead span {
      display: block;
    }
    .lead {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.25rem;
      line-height: 1.8;
      margin: 34px auto 36px;
      max-width: 760px;
    }
    .stats-band {
      margin-top: -18px;
      padding: 0 24px 58px;
      position: relative;
      z-index: 1;
    }
    .stats-grid {
      background: #fff;
      border: 1px solid #e6efed;
      border-radius: 12px;
      box-shadow: 0 18px 44px rgba(7, 59, 58, 0.12);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      margin: 22px auto 0;
      max-width: 1120px;
      overflow: hidden;
    }
    .stats-grid div {
      padding: 26px 18px;
      text-align: center;
    }
    .stats-grid div + div {
      border-left: 1px solid #e6efed;
    }
    .stats-grid strong {
      color: #0b6f6f;
      display: block;
      font-size: 2rem;
      line-height: 1;
    }
    .stats-grid span {
      color: #64706f;
      display: block;
      font-size: 0.92rem;
      font-weight: 800;
      margin-top: 8px;
    }
    .section {
      margin: 0 auto;
      padding: 78px 24px;
    }
    .white-section {
      background: #fff;
    }
    .muted-section {
      background: #f7faf9;
    }
    .section > * {
      margin-left: auto;
      margin-right: auto;
      max-width: 1200px;
    }
    .section-heading {
      margin-bottom: 34px;
    }
    .section-heading.split {
      align-items: end;
      display: flex;
      gap: 24px;
      justify-content: space-between;
    }
    .section-heading.center {
      max-width: 720px;
      text-align: center;
    }
    h2 {
      color: #073b3a;
      font-size: clamp(1.8rem, 3vw, 2.6rem);
      line-height: 1.15;
      margin: 0;
    }
    .section-heading p,
    .section-copy {
      color: #64706f;
      line-height: 1.75;
      margin: 10px 0 0;
    }
    .listing-grid,
    .blog-grid {
      display: grid;
      gap: 24px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .location-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .location-card {
      border-radius: 12px;
      box-shadow: 0 14px 32px rgba(7, 59, 58, 0.12);
      color: #fff;
      display: block;
      height: 230px;
      overflow: hidden;
      position: relative;
      text-decoration: none;
    }
    .location-card img {
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
      width: 100%;
    }
    .location-card:hover img {
      transform: scale(1.06);
    }
    .shade {
      background: linear-gradient(180deg, transparent, rgba(7, 59, 58, 0.92));
      inset: 0;
      position: absolute;
    }
    .location-text {
      bottom: 20px;
      left: 20px;
      position: absolute;
      right: 20px;
    }
    .location-text strong {
      display: block;
      font-size: 1.5rem;
    }
    .location-text small {
      color: rgba(255, 255, 255, 0.82);
      display: block;
      margin-top: 4px;
    }
    .project-layout {
      display: grid;
      gap: 36px;
      grid-template-columns: 1.15fr 0.85fr;
    }
    .project-list {
      display: grid;
      gap: 16px;
      margin-top: 26px;
    }
    .project-card {
      align-items: center;
      background: #fff;
      border: 1px solid #e6efed;
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(7, 59, 58, 0.07);
      color: inherit;
      display: grid;
      gap: 18px;
      grid-template-columns: 170px 1fr;
      padding: 14px;
      text-decoration: none;
    }
    .project-card img {
      aspect-ratio: 4 / 3;
      border-radius: 9px;
      object-fit: cover;
      width: 100%;
    }
    .project-card strong,
    .project-card small,
    .project-card b {
      display: block;
    }
    .project-card strong {
      color: #073b3a;
      font-size: 1.1rem;
    }
    .project-card small {
      color: #64706f;
      margin-top: 6px;
    }
    .project-card b {
      color: #0b6f6f;
      margin-top: 10px;
    }
    .why-panel {
      background: #f7faf9;
      border: 1px solid #e6efed;
      border-radius: 14px;
      padding: 28px;
    }
    .why-list {
      display: grid;
      gap: 14px;
      margin-top: 24px;
    }
    .why-list div {
      background: #fff;
      border-radius: 10px;
      padding: 18px;
    }
    .why-list strong {
      color: #073b3a;
      display: block;
      margin-bottom: 6px;
    }
    .why-list p {
      color: #64706f;
      line-height: 1.6;
      margin: 0;
    }
    .blog-card {
      background: #fff;
      border: 1px solid #e6efed;
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(7, 59, 58, 0.07);
      color: inherit;
      overflow: hidden;
      text-decoration: none;
    }
    .blog-card img {
      height: 180px;
      object-fit: cover;
      width: 100%;
    }
    .blog-card span {
      display: block;
      padding: 18px;
    }
    .blog-card small {
      color: #0b6f6f;
      font-weight: 800;
    }
    .blog-card strong {
      color: #073b3a;
      display: block;
      font-size: 1.08rem;
      line-height: 1.4;
      margin-top: 8px;
    }
    .blog-card p {
      color: #64706f;
      line-height: 1.6;
      margin: 8px 0 0;
    }
    @media (max-width: 1040px) {
      .listing-grid,
      .blog-grid,
      .location-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .project-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 680px) {
      .hero-content {
        padding: 78px 18px 96px;
        width: 100vw;
        max-width: 100vw;
      }
      h1 {
        font-size: 2rem;
        gap: 12px;
        line-height: 1.28;
        max-width: 340px;
        word-break: break-word;
      }
      .lead {
        font-size: 1rem;
        max-width: 340px;
      }
      .stats-grid,
      .listing-grid,
      .blog-grid,
      .location-grid {
        grid-template-columns: 1fr;
      }
      .stats-grid div + div {
        border-left: 0;
        border-top: 1px solid #e6efed;
      }
      .section-heading.split {
        align-items: start;
        flex-direction: column;
      }
      .project-card {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class HomeComponent implements OnInit {
  featuredProperties: Property[] = [];
  projects: Project[] = [];
  blogs: Blog[] = [];

  stats = [
    { label: 'ประกาศทั้งหมด', value: '5,240+' },
    { label: 'โครงการใหม่', value: '180+' },
    { label: 'ผู้ใช้งาน/เดือน', value: '25K+' },
    { label: 'ความพึงพอใจ', value: '99%' }
  ];

  popularLocations = [
    { name: 'สุขุมวิท', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=700&q=80', count: 1240 },
    { name: 'อโศก', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=700&q=80', count: 850 },
    { name: 'พระราม 9', image: 'https://images.unsplash.com/photo-1590602846989-e99039644026?auto=format&fit=crop&w=700&q=80', count: 620 },
    { name: 'สาทร', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=700&q=80', count: 540 }
  ];

  whyChoose = [
    { title: 'ค้นหาง่าย', text: 'กรองตามทำเล ราคา และจำนวนห้องนอนได้ทันที' },
    { title: 'ข้อมูลครบ', text: 'แสดงราคา ขนาดห้อง รายละเอียด และช่องทางติดต่อครบในหน้าเดียว' },
    { title: 'ประกาศคุณภาพ', text: 'จัดข้อมูลเป็นระบบ เหมาะต่อการเชื่อมต่อ API ภายหลัง' },
    { title: 'รองรับทุกหน้าจอ', text: 'เลย์เอาต์ปรับตาม desktop, tablet และ mobile' }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    forkJoin({
      properties: this.dataService.getPropertiesFromApi({ sort: 'latest' }),
      projects: this.dataService.getProjectsFromApi(),
      blogs: this.dataService.getBlogsFromApi()
    }).subscribe(({ properties, projects, blogs }) => {
      this.featuredProperties = properties.slice(0, 4);
      this.projects = projects;
      this.blogs = blogs;
    });
  }
}
