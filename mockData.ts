
import { Report, ReportCategory, Severity } from './types';

export const INITIAL_REPORTS: Report[] = [
  {
    id: '1',
    title: 'ZESA Transformer Fault',
    description: 'The transformer on Samora Machel Ave blew up last night. The whole block is without power and traffic lights are down.',
    category: ReportCategory.INFRASTRUCTURE,
    severity: Severity.HIGH,
    location: 'Samora Machel Ave, Harare',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    votes: 45,
    status: 'Open',
    author: 'Tendai M.'
  },
  {
    id: '2',
    title: 'Suspicious Honda Fit',
    description: 'A silver Honda Fit without plates has been parked near the primary school gate for 2 hours. Driver is just sitting there.',
    category: ReportCategory.SUSPICIOUS,
    severity: Severity.MEDIUM,
    location: 'Borrowdale Road, Harare',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    votes: 12,
    status: 'Investigating',
    author: 'Sarah K.'
  },
  {
    id: '3',
    title: 'Lost Boerboel Puppy',
    description: 'Brown Boerboel puppy lost near the shops. Answers to "Simba". Please help!',
    category: ReportCategory.LOST_FOUND,
    severity: Severity.LOW,
    location: 'Hillside, Bulawayo',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    votes: 28,
    status: 'Open',
    author: 'Nkosana D.'
  },
  {
    id: '4',
    title: 'Burst Water Pipe',
    description: 'Major council pipe burst flooding the road. Water is wasted everywhere, road is becoming impassable.',
    category: ReportCategory.INFRASTRUCTURE,
    severity: Severity.CRITICAL,
    location: 'Second Street Ext, Avondale',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    votes: 60,
    status: 'Open',
    author: 'Chipo Z.'
  },
  {
    id: '5',
    title: 'Community Braai',
    description: 'Neighborhood braai at the sports club this Saturday. Bring your own drinks and cooler box!',
    category: ReportCategory.COMMUNITY,
    severity: Severity.LOW,
    location: 'Old Georgians Sports Club',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    votes: 85,
    status: 'Resolved',
    author: 'Farai G.'
  }
];
