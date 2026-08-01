import { useEffect, useState } from 'react'
import { Users, Building2, Package, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import api from '@/lib/axios'

interface Stats {
  employees: number
  departments: number
  products: number
  orders: number
}

const statCards = (stats: Stats) => [
  { label: 'Employees', value: stats.employees, icon: Users, color: 'text-blue-500' },
  { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-purple-500' },
  { label: 'Products', value: stats.products, icon: Package, color: 'text-green-500' },
  { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-orange-500' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({ employees: 0, departments: 0, products: 0, orders: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emp, dep, prod, ord] = await Promise.allSettled([
          api.get('/employees'),
          api.get('/departments'),
          api.get('/products'),
          api.get('/orders'),
        ])

        setStats({
          employees: emp.status === 'fulfilled' ? emp.value.data.data.employees.length : 0,
          departments: dep.status === 'fulfilled' ? dep.value.data.data.departments.length : 0,
          products: prod.status === 'fulfilled' ? prod.value.data.data.products.length : 0,
          orders: ord.status === 'fulfilled' ? ord.value.data.data.orders.length : 0,
        })
      } catch {}
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.fullname}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards(stats).map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon size={18} className={color} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user?.fullname}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{user?.roles?.[0]}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
