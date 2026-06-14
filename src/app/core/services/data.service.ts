import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Blog, Package, Project, Property } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiBase = '/api';

  constructor(private http: HttpClient) {}

  getPropertiesFromApi(filters: {
    type?: 'sell' | 'rent';
    location?: string;
    priceRange?: string;
    bedrooms?: string;
    sort?: string;
  } = {}): Observable<Property[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<Property[]>(`${this.apiBase}/properties`, { params }).pipe(
      catchError(() => of(this.searchProperties(filters)))
    );
  }

  getPropertyFromApi(id: string): Observable<Property | undefined> {
    return this.http.get<Property>(`${this.apiBase}/properties/${id}`).pipe(
      catchError(() => of(this.getProperties().find((property) => property.id === id)))
    );
  }

  getProjectsFromApi(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiBase}/projects`).pipe(
      catchError(() => of(this.getProjects()))
    );
  }

  getProjectFromApi(id: string): Observable<Project | undefined> {
    return this.http.get<Project>(`${this.apiBase}/projects/${id}`).pipe(
      catchError(() => of(this.getProjects().find((project) => project.id === id)))
    );
  }

  getPackagesFromApi(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiBase}/packages`).pipe(
      catchError(() => of(this.getPackages()))
    );
  }

  getBlogsFromApi(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiBase}/blogs`).pipe(
      catchError(() => of(this.getBlogs()))
    );
  }

  getProperties(): Property[] {
    return [
      {
        id: '1',
        title: 'ห้องวิวเมือง แต่งครบ ใกล้ BTS ปุณณวิถี',
        projectName: 'The Line Sukhumvit 101',
        location: 'สุขุมวิท',
        price: 4500000,
        type: 'sell',
        bedrooms: 1,
        bathrooms: 1,
        area: 32,
        floor: 24,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80'],
        description: 'คอนโดพร้อมอยู่ เดินทางสะดวก ใกล้ BTS ปุณณวิถี เหมาะสำหรับอยู่อาศัยและลงทุนปล่อยเช่า',
        amenities: ['สระว่ายน้ำ', 'ฟิตเนส', 'Co-working space', 'สวนส่วนกลาง'],
        nearby: ['BTS ปุณณวิถี', 'True Digital Park'],
        contactName: 'คุณสมชาย',
        contactPhone: '081-234-5678',
        badge: 'แนะนำ',
        isPromoted: true
      },
      {
        id: '2',
        title: 'ห้องมุม New CBD พร้อมเฟอร์นิเจอร์',
        projectName: 'Life Asoke Rama 9',
        location: 'พระราม 9',
        price: 5200000,
        type: 'sell',
        bedrooms: 1,
        bathrooms: 1,
        area: 35,
        floor: 31,
        images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80'],
        description: 'ทำเลศูนย์กลางธุรกิจใหม่ ใกล้ MRT พระราม 9 และห้างสรรพสินค้าหลักของย่าน',
        amenities: ['Sky Lounge', 'สระว่ายน้ำ', 'ฟิตเนส 2 ชั้น'],
        nearby: ['MRT พระราม 9', 'Central Rama 9'],
        contactName: 'คุณวิไล',
        contactPhone: '089-876-5432',
        badge: 'ขาย'
      },
      {
        id: '3',
        title: 'คอนโด 2 ห้องนอน ติดรถไฟฟ้า วิวโล่ง',
        projectName: 'Ideo Q Victory',
        location: 'พญาไท',
        price: 8900000,
        type: 'sell',
        bedrooms: 2,
        bathrooms: 1,
        area: 48,
        floor: 18,
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80'],
        description: 'ห้องกว้าง แปลนดี ใกล้ BTS อนุสาวรีย์ชัยฯ เหมาะกับครอบครัวขนาดเล็ก',
        amenities: ['Infinity Pool', 'ฟิตเนส', 'Private Lounge'],
        nearby: ['BTS อนุสาวรีย์ชัยฯ', 'King Power'],
        contactName: 'คุณกิตติ',
        contactPhone: '082-345-6789',
        badge: 'Hot',
        isPromoted: true
      },
      {
        id: '4',
        title: 'ให้เช่าห้องวิวแม่น้ำ ชั้นสูง พร้อมเข้าอยู่',
        projectName: 'Rhythm Sathorn',
        location: 'สาทร',
        price: 25000,
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 38,
        floor: 29,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80'],
        description: 'ห้องตกแต่งครบ วิวแม่น้ำ เดินทางสะดวก ใกล้ BTS สะพานตากสิน',
        amenities: ['สระว่ายน้ำดาดฟ้า', 'Sky Garden', 'ฟิตเนส'],
        nearby: ['BTS สะพานตากสิน', 'ICONSIAM'],
        contactName: 'Agent Nan',
        contactPhone: '083-456-7890',
        badge: 'เช่าดี'
      },
      {
        id: '5',
        title: 'ห้องสวยใจกลางอารีย์ ใกล้คาเฟ่และรถไฟฟ้า',
        projectName: 'Noble Around Ari',
        location: 'อารีย์',
        price: 7500000,
        type: 'sell',
        bedrooms: 1,
        bathrooms: 1,
        area: 30,
        floor: 16,
        images: ['https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=80'],
        description: 'ทำเลไลฟ์สไตล์ยอดนิยม เดินทางง่าย ใกล้ BTS อารีย์ เหมาะกับคนทำงานเมือง',
        amenities: ['Lobby', 'ฟิตเนส', 'สระว่ายน้ำ'],
        nearby: ['BTS อารีย์', 'La Villa Ari'],
        contactName: 'คุณปาน',
        contactPhone: '084-567-8901',
        badge: 'แนะนำ'
      },
      {
        id: '6',
        title: 'เพนท์เฮาส์ขนาดใหญ่ ใจกลางอโศก',
        projectName: 'Ashton Asoke',
        location: 'อโศก',
        price: 12000000,
        type: 'sell',
        bedrooms: 2,
        bathrooms: 2,
        area: 64,
        floor: 42,
        images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80'],
        description: 'ติด MRT สุขุมวิท และ BTS อโศก ทำเลพรีเมียมสำหรับอยู่อาศัยหรือถือครองระยะยาว',
        amenities: ['สระว่ายน้ำ', 'Jacuzzi', 'Steam Room', 'Sauna'],
        nearby: ['BTS อโศก', 'MRT สุขุมวิท', 'Terminal 21'],
        contactName: 'คุณริน',
        contactPhone: '085-678-9012',
        badge: 'พรีเมียม'
      },
      {
        id: '7',
        title: 'ให้เช่าห้องอบอุ่นในโครงการ T77',
        projectName: 'The Base Park West',
        location: 'อ่อนนุช',
        price: 15000,
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 28,
        floor: 12,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80'],
        description: 'คอนโดให้เช่าแต่งครบ บรรยากาศร่มรื่น ในโครงการที่มีร้านค้าและพื้นที่ส่วนกลางครบ',
        amenities: ['สวนรอบโครงการ', 'สระว่ายน้ำ', 'ฟิตเนส'],
        nearby: ['BTS อ่อนนุช', 'Habito Mall'],
        contactName: 'คุณต้น',
        contactPhone: '086-789-0123',
        badge: 'เช่า'
      },
      {
        id: '8',
        title: 'คอนโดเพดานสูง ใกล้ BTS อ่อนนุช',
        projectName: 'Knightsbridge Prime Onnut',
        location: 'อ่อนนุช',
        price: 3800000,
        type: 'sell',
        bedrooms: 1,
        bathrooms: 1,
        area: 27,
        floor: 22,
        images: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=900&q=80'],
        description: 'ยูนิตขนาดกำลังดี เพดานสูง โปร่งสบาย ใกล้รถไฟฟ้าและแหล่งของกินย่านอ่อนนุช',
        amenities: ['Sky Fitness', 'สระว่ายน้ำ', 'ที่จอดรถ'],
        nearby: ['BTS อ่อนนุช', 'Lotus Onnut'],
        contactName: 'คุณพลอย',
        contactPhone: '087-890-1234',
        badge: 'ขาย'
      }
    ];
  }

  searchProperties(filters: {
    type?: 'sell' | 'rent';
    location?: string;
    priceRange?: string;
    bedrooms?: string;
    sort?: string;
  }): Property[] {
    let result = this.getProperties();

    if (filters.type) {
      result = result.filter((property) => property.type === filters.type);
    }

    const keyword = filters.location?.trim().toLowerCase();
    if (keyword) {
      result = result.filter((property) =>
        [property.location, property.projectName, property.title, ...(property.nearby ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (filters.priceRange) {
      const isOpenEnded = filters.priceRange.endsWith('+');
      const [minRaw, maxRaw] = filters.priceRange.replace('+', '').split('-');
      const min = Number(minRaw);
      const max = Number(maxRaw);
      result = result.filter((property) =>
        isOpenEnded ? property.price >= min : property.price >= min && property.price <= max
      );
    }

    if (filters.bedrooms) {
      const bedrooms = Number(filters.bedrooms);
      result = result.filter((property) => (bedrooms >= 3 ? property.bedrooms >= 3 : property.bedrooms === bedrooms));
    }

    if (filters.sort === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    }
    if (filters.sort === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }

  getProjects(): Project[] {
    return [
      {
        id: 'p1',
        name: 'The Line Sukhumvit 101',
        developer: 'Sansiri',
        location: 'สุขุมวิท 101',
        startingPrice: 4200000,
        status: 'Ready to move',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
        description: 'โครงการพร้อมอยู่ ใกล้ BTS ปุณณวิถี พร้อมพื้นที่ส่วนกลางครบ'
      },
      {
        id: 'p2',
        name: 'Life Asoke Rama 9',
        developer: 'AP Thailand',
        location: 'พระราม 9',
        startingPrice: 4800000,
        status: 'Ready to move',
        image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80',
        description: 'คอนโดใจกลาง New CBD เชื่อมต่อ MRT และแหล่งงานสำคัญ'
      },
      {
        id: 'p3',
        name: 'Origin Plug & Play Ramintra',
        developer: 'Origin Property',
        location: 'รามอินทรา',
        startingPrice: 2990000,
        status: 'Under construction',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
        description: 'โครงการใหม่พร้อมฟังก์ชันสำหรับคนทำงานยุคใหม่'
      }
    ];
  }

  getPackages(): Package[] {
    return [
      {
        id: 'free',
        name: 'เริ่มต้น',
        price: 0,
        listingsLimit: 1,
        durationDays: 7,
        imageLimit: 5,
        features: ['ลงประกาศได้ 1 รายการ', 'แสดงผล 7 วัน', 'อัปโหลดรูปได้ 5 รูป', 'เหมาะสำหรับทดลองใช้งาน']
      },
      {
        id: 'standard',
        name: 'มาตรฐาน',
        price: 299,
        listingsLimit: 5,
        durationDays: 30,
        imageLimit: 15,
        features: ['ลงประกาศได้ 5 รายการ', 'แสดงผล 30 วัน', 'อัปโหลดรูปได้ 15 รูป', 'มี Badge แนะนำ']
      },
      {
        id: 'premium',
        name: 'พรีเมียม',
        price: 599,
        listingsLimit: 15,
        durationDays: 60,
        imageLimit: 30,
        isPremium: true,
        features: ['ลงประกาศได้ 15 รายการ', 'แสดงผล 60 วัน', 'ดันประกาศขึ้นด้านบน', 'มี Badge ประกาศพรีเมียม']
      }
    ];
  }

  getBlogs(): Blog[] {
    return [
      {
        id: 'b1',
        title: 'วิธีเลือกคอนโดใกล้รถไฟฟ้าให้คุ้มค่า',
        excerpt: 'เช็กลิสต์เรื่องทำเล ระยะเดิน และค่าใช้จ่ายที่ควรรู้ก่อนตัดสินใจ',
        category: 'ความรู้เรื่องคอนโด',
        date: '10 มิ.ย. 2026',
        image: 'https://images.unsplash.com/photo-1449156001533-cb39c7324c60?auto=format&fit=crop&w=900&q=80',
        content: 'เริ่มจากกำหนดเส้นทางเดินทางประจำวัน แล้วเปรียบเทียบราคาเฉลี่ยของแต่ละสถานี'
      },
      {
        id: 'b2',
        title: 'ซื้อคอนโดปล่อยเช่า ยังน่าสนใจไหม',
        excerpt: 'มองผลตอบแทนจากค่าเช่า อัตราว่าง และค่าใช้จ่ายระยะยาวแบบเข้าใจง่าย',
        category: 'การลงทุน',
        date: '5 มิ.ย. 2026',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
        content: 'ทำเลใกล้รถไฟฟ้าและแหล่งงานยังเป็นปัจจัยสำคัญในการปล่อยเช่า'
      },
      {
        id: 'b3',
        title: 'เช็กลิสต์ก่อนซื้อคอนโดมือสอง',
        excerpt: 'จุดที่ต้องตรวจเมื่อไปดูห้องจริง เพื่อไม่พลาดค่าใช้จ่ายซ่อนอยู่',
        category: 'มือใหม่ซื้อคอนโด',
        date: '1 มิ.ย. 2026',
        image: 'https://images.unsplash.com/photo-1556912171-3f1856757a37?auto=format&fit=crop&w=900&q=80',
        content: 'ตรวจสภาพห้อง ระบบน้ำ ไฟ และนิติบุคคลก่อนวางเงินจอง'
      }
    ];
  }
}
