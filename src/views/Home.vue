<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="container">
        <h1>Admin Dashboard</h1>
        <p>Manage your Promise Healthcare website and operations</p>
      </div>
    </div>

    <div class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ stats.totalUsers }}</h3>
              <p>Total Users</p>
              <span class="stat-change positive">+12%</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👨‍⚕️</div>
            <div class="stat-content">
              <h3>{{ stats.totalDoctors }}</h3>
              <p>Active Doctors</p>
              <span class="stat-change positive">+3</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <h3>{{ stats.appointments }}</h3>
              <p>Today's Appointments</p>
              <span class="stat-change positive">+8</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>${{ stats.revenue }}</h3>
              <p>Monthly Revenue</p>
              <span class="stat-change positive">+15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="container">
        <div class="content-grid">
          <div class="content-card">
            <div class="card-header">
              <h3>Recent Activity</h3>
              <button class="btn btn-secondary">View All</button>
            </div>
            <div class="activity-list">
              <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
                <div class="activity-icon">{{ activity.icon }}</div>
                <div class="activity-content">
                  <p>{{ activity.message }}</p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-card">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="quick-actions">
              <router-link to="/doctors" class="action-btn">
                <span class="action-icon">👨‍⚕️</span>
                <span>Add Doctor</span>
              </router-link>
              <router-link to="/offers" class="action-btn">
                <span class="action-icon">🎁</span>
                <span>Create Offer</span>
              </router-link>
              <router-link to="/testimonials" class="action-btn">
                <span class="action-icon">💬</span>
                <span>Manage Reviews</span>
              </router-link>
              <router-link to="/contact" class="action-btn">
                <span class="action-icon">📞</span>
                <span>View Messages</span>
              </router-link>
            </div>
          </div>
        </div>

        <div class="charts-section">
          <div class="chart-card">
            <div class="card-header">
              <h3>Website Analytics</h3>
              <div class="chart-controls">
                <button class="btn btn-sm" :class="{ active: selectedPeriod === 'week' }" @click="selectedPeriod = 'week'">Week</button>
                <button class="btn btn-sm" :class="{ active: selectedPeriod === 'month' }" @click="selectedPeriod = 'month'">Month</button>
                <button class="btn btn-sm" :class="{ active: selectedPeriod === 'year' }" @click="selectedPeriod = 'year'">Year</button>
              </div>
            </div>
            <div class="chart-placeholder">
              <div class="chart-content">
                <h4>📈 Analytics Chart</h4>
                <p>Website traffic and user engagement data for {{ selectedPeriod }}</p>
                <div class="chart-stats">
                  <div class="chart-stat">
                    <span class="stat-number">{{ analytics.visitors }}</span>
                    <span class="stat-label">Visitors</span>
                  </div>
                  <div class="chart-stat">
                    <span class="stat-number">{{ analytics.pageViews }}</span>
                    <span class="stat-label">Page Views</span>
                  </div>
                  <div class="chart-stat">
                    <span class="stat-number">{{ analytics.conversion }}%</span>
                    <span class="stat-label">Conversion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'Dashboard',
  setup() {
    console.log('Home component setup called')
    
    onMounted(() => {
      console.log('Home component mounted')
    })
    
    const selectedPeriod = ref('month')
    
    const stats = reactive({
      totalUsers: '2,847',
      totalDoctors: '24',
      appointments: '156',
      revenue: '45,230'
    })

    const recentActivity = ref([
      {
        id: 1,
        icon: '👤',
        message: 'New user registration: John Doe',
        time: '2 minutes ago'
      },
      {
        id: 2,
        icon: '📅',
        message: 'Appointment booked with Dr. Sarah Johnson',
        time: '15 minutes ago'
      },
      {
        id: 3,
        icon: '💬',
        message: 'New testimonial submitted',
        time: '1 hour ago'
      },
      {
        id: 4,
        icon: '📞',
        message: 'Contact form submission received',
        time: '2 hours ago'
      },
      {
        id: 5,
        icon: '👨‍⚕️',
        message: 'Dr. Michael Chen profile updated',
        time: '3 hours ago'
      }
    ])

    const analytics = reactive({
      visitors: '12,450',
      pageViews: '45,230',
      conversion: '3.2'
    })

    return {
      selectedPeriod,
      stats,
      recentActivity,
      analytics
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8f9fa;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.dashboard-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.container {
  width: 100%;
  padding: 0 2rem;
  max-width: none;
}

.stats-section {
  padding: 2rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.2rem;
}

.stat-content p {
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #28a745;
}

.dashboard-content {
  padding: 2rem 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  color: #2c3e50;
  font-size: 1.3rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-sm {
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
}

.btn.active {
  background: #667eea;
  color: white;
}

.activity-list {
  space-y: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-content p {
  color: #2c3e50;
  margin-bottom: 0.2rem;
}

.activity-time {
  color: #666;
  font-size: 0.9rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.charts-section {
  margin-top: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-placeholder {
  height: 300px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-content {
  text-align: center;
}

.chart-content h4 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.chart-content p {
  color: #666;
  margin-bottom: 2rem;
}

.chart-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.chart-stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.2rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .chart-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
