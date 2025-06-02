// User related types
export type UserRole = 'USER' | 'MERCHANT' | 'ADMIN'

export interface User {
  id: number
  username: string
  password: string
  email: string
  phone: string
  role: UserRole
  avatar: string
  createdAt: string
  updatedAt: string
}

// Merchant related types
export type MerchantStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Merchant {
  id: number
  user: User
  storeName: string
  storeDescription: string
  storeAddress: string
  status: MerchantStatus
  createdAt: string
  updatedAt: string
  coverImage: string
  wechatQr: string
  alipayQr: string
}

// Dish related types
export interface Dish {
  id: number
  merchant: Merchant
  name: string
  description: string
  price: number
  estimatedWaitTime: number
  imageUrl: string
  available: boolean
  createdAt: string
  updatedAt: string
}

// Order related types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELED'

export interface Order {
  id: number
  user: User
  merchant: Merchant
  totalPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

// Review related types
export interface Review {
  id: number
  order: Order
  user: User
  dish: Dish
  rating: number
  comment: string
  createdAt: string
}

// Cart related types
export interface Cart {
  id: number
  user: User
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: number
  cart: Cart
  dish: Dish
  quantity: number
  createdAt: string
  updatedAt: string
}

// AI Recommendation related types
export type RecommendationType = 'USER' | 'MERCHANT'

export interface AIRecommendation {
  id: number
  user: User
  merchant: Merchant
  recommendedItems: string
  recommendationType: RecommendationType
  createdAt: string
}

// Seasonal Vegetable related types
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | 'YEAR_ROUND'

export interface SeasonalVegetable {
  id: number
  name: string
  season: Season
}

// OrderItem related types
export interface OrderItem {
  id: number
  order: Order
  dish: Dish
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface DateRange {
  startDate: string
  endDate: string
} 