export type PropertyType = 'sell' | 'rent';

export interface Property {
  id: string;
  title: string;
  projectName: string;
  location: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number; // sq.m
  floor?: number;
  images: string[];
  description: string;
  amenities: string[];
  nearby?: string[];
  contactName: string;
  contactPhone: string;
  contactLine?: string;
  badge?: string;
  isPromoted?: boolean;
}

export interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  startingPrice: number;
  status: 'Ready to move' | 'Under construction';
  image: string;
  description: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  listingsLimit: number;
  durationDays: number;
  imageLimit: number;
  features: string[];
  isPremium?: boolean;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  content: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Buyer' | 'Owner' | 'Agent';
  packageId?: string;
  listingsCount: number;
}
