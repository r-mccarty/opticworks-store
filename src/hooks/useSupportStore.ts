"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  category: string
  orderNumber?: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
}

export interface SupportTicket {
  id: string
  type: 'contact' | 'warranty'
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: string
  subject: string
  message: string
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  resolution?: string
}

export interface WarrantyClaimData {
  firstName: string
  lastName: string
  email: string
  phone: string
  orderNumber: string
  purchaseDate: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  issueType: string
  issueDescription: string
  installationDate?: string
  installedByProfessional: 'yes' | 'no' | 'unsure'
}

interface SupportStore {
  // Contact form state
  contactForm: Partial<ContactFormData>
  setContactForm: (data: Partial<ContactFormData>) => void
  resetContactForm: () => void
  
  // Warranty form state
  warrantyForm: Partial<WarrantyClaimData>
  setWarrantyForm: (data: Partial<WarrantyClaimData>) => void
  resetWarrantyForm: () => void
  
  // Support tickets
  tickets: SupportTicket[]
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void
  getTicketById: (id: string) => SupportTicket | undefined
  getUserTickets: (email: string) => SupportTicket[]
  
  // FAQ search and filtering
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedFAQCategory: string
  setSelectedFAQCategory: (category: string) => void
  
  // User preferences
  preferredContactMethod: 'email' | 'phone' | 'chat'
  setPreferredContactMethod: (method: 'email' | 'phone' | 'chat') => void
  
  // Support session tracking
  currentSession: {
    startTime: Date | null
    pageViews: string[]
    searchQueries: string[]
  }
  startSupportSession: () => void
  addPageView: (page: string) => void
  addSearchQuery: (query: string) => void
  endSupportSession: () => void
}

export const useSupportStore = create<SupportStore>()(
  persist(
    (set, get) => ({
      // Contact form state
      contactForm: {},
      setContactForm: (data) => {
        set(state => ({
          contactForm: { ...state.contactForm, ...data }
        }))
      },
      resetContactForm: () => {
        set({ contactForm: {} })
      },
      
      // Warranty form state
      warrantyForm: {},
      setWarrantyForm: (data) => {
        set(state => ({
          warrantyForm: { ...state.warrantyForm, ...data }
        }))
      },
      resetWarrantyForm: () => {
        set({ warrantyForm: {} })
      },
      
      // Support tickets
      tickets: [],
      addTicket: (ticketData) => {
        const id = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        
        const ticket: SupportTicket = {
          ...ticketData,
          id,
          createdAt: now,
          updatedAt: now,
        }
        
        set(state => ({
          tickets: [...state.tickets, ticket]
        }))
        
        return id
      },
      
      updateTicketStatus: (id, status) => {
        set(state => ({
          tickets: state.tickets.map(ticket =>
            ticket.id === id
              ? { ...ticket, status, updatedAt: new Date() }
              : ticket
          )
        }))
      },
      
      getTicketById: (id) => {
        return get().tickets.find(ticket => ticket.id === id)
      },
      
      getUserTickets: (email) => {
        return get().tickets.filter(ticket => 
          ticket.customerInfo.email.toLowerCase() === email.toLowerCase()
        )
      },
      
      // FAQ search and filtering
      searchQuery: '',
      setSearchQuery: (query) => {
        set({ searchQuery: query })
        // Also track this as a search query
        get().addSearchQuery(query)
      },
      
      selectedFAQCategory: 'all',
      setSelectedFAQCategory: (category) => {
        set({ selectedFAQCategory: category })
      },
      
      // User preferences
      preferredContactMethod: 'email',
      setPreferredContactMethod: (method) => {
        set({ preferredContactMethod: method })
      },
      
      // Support session tracking
      currentSession: {
        startTime: null,
        pageViews: [],
        searchQueries: []
      },
      
      startSupportSession: () => {
        set({
          currentSession: {
            startTime: new Date(),
            pageViews: [],
            searchQueries: []
          }
        })
      },
      
      addPageView: (page) => {
        set(state => ({
          currentSession: {
            ...state.currentSession,
            pageViews: [...state.currentSession.pageViews, page]
          }
        }))
      },
      
      addSearchQuery: (query) => {
        if (query.trim()) {
          set(state => ({
            currentSession: {
              ...state.currentSession,
              searchQueries: [...state.currentSession.searchQueries, query.trim()]
            }
          }))
        }
      },
      
      endSupportSession: () => {
        set({
          currentSession: {
            startTime: null,
            pageViews: [],
            searchQueries: []
          }
        })
      }
    }),
    {
      name: 'support-storage',
      partialize: (state) => ({
        tickets: state.tickets,
        preferredContactMethod: state.preferredContactMethod,
        contactForm: state.contactForm,
        warrantyForm: state.warrantyForm
      })
    }
  )
)