import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  iconBgColor 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative">
      {/* Icon positioned at top right */}
      <div 
        className={`absolute top-5 right-5 w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColor}`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      
      {/* Content */}
      <div className="pr-12">
        <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
    </div>
  )
}
