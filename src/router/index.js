import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Doctors from '../views/Doctors.vue'
import Offers from '../views/Offers.vue'
import Testimonials from '../views/Testimonials.vue'
import Contact from '../views/Contact.vue'
import Treatments from '../views/Treatments.vue'
import Appointments from '../views/Appointments.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Home
  },
  {
    path: '/doctors',
    name: 'Doctors',
    component: Doctors
  },
  {
    path: '/offers',
    name: 'Offers',
    component: Offers
  },
  {
    path: '/testimonials',
    name: 'Testimonials',
    component: Testimonials
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/treatments',
    name: 'Treatments',
    component: Treatments
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: Appointments
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
