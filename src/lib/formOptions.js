import {
  Calendar,
  CalendarClock,
  Hammer,
  Home,
  Paintbrush,
  Wrench,
  Zap,
} from 'lucide-react'

export const SERVICE_OPTIONS = [
  {
    value: 'residential-roofing-siding',
    label: 'Residential Roofing & Siding',
    icon: Home,
  },
  {
    value: 'interior-exterior-painting',
    label: 'Interior & Exterior Painting',
    icon: Paintbrush,
  },
  {
    value: 'home-remodeling-structural',
    label: 'Home Remodeling & Structural Upgrades',
    icon: Hammer,
  },
  {
    value: 'repairs-handyman',
    label: 'Repairs & Handyman Maintenance',
    icon: Wrench,
  },
]

export { SERVICES, TIMELINES } from '@/lib/formEnums'

export const TIMELINE_OPTIONS = [
  {
    value: 'asap-structural-failure',
    label: 'ASAP / Active Structural Failure',
    icon: Zap,
  },
  {
    value: 'within-2-4-weeks',
    label: 'Within 2-4 Weeks',
    icon: CalendarClock,
  },
  {
    value: 'gathering-estimates',
    label: 'Just Gathering Estimates / Planning Ahead',
    icon: Calendar,
  },
]
