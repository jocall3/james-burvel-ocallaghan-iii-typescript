// components/views/personal/RewardsHubView.tsx
import React, { useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { RewardItem } from '../../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

// --- ENHANCED TYPES AND INTERFACES ---

/**
 * Represents a single achievement or badge a user can earn.
 */
export type Achievement = {
    id: string;
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    unlocked: boolean;
    unlockedDate?: string;
    progress?: {
        current: number;
        total: number;
    };
};

/**
 * Represents a daily or weekly quest for earning bonus points.
 */
export type Quest = {
    id: string;
    title: string;
    description: string;
    points: number;
    type: 'daily' | 'weekly' | 'special';
    isCompleted: boolean;
    progress: {
        current: number;
        total: number;
    };
};

/**
 * Represents a single entry in the leaderboard.
 */
export type LeaderboardEntry = {
    rank: number;
    userId: string;
    username: string;
    avatarUrl?: string;
    points: number;
    isCurrentUser: boolean;
};

/**
 * Represents a single transaction in the user's points history.
 */
export type PointsTransaction = {
    id: string;
    date: string;
    description: string;
    points: number; // positive for earned, negative for spent
    type: 'earn' | 'redeem' | 'bonus' | 'adjustment' | 'gift_sent' | 'gift_received';
};

/**
 * Represents an item from the user's redemption history.
 */
export type RedemptionHistoryItem = {
    orderId: string;
    itemId: string;
    itemName: string;
    cost: number;
    redemptionDate: string;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'digital_code_sent';
    trackingNumber?: string;
    digitalCode?: string;
};

/**
 * Represents different reward categories for filtering.
 */
export type RewardCategory = 'all' | 'gift_card' | 'merchandise' | 'donation' | 'digital';

/**
 * Represents a user's notification preferences for the rewards hub.
 */
export type RewardNotificationSettings = {
    newRewards: boolean;
    pointsExpirationWarning: boolean;
    questUpdates: boolean;
    leaderboardChanges: boolean;
    redemptionStatus: boolean;
};

// --- EXPANDED ICONS LIBRARY ---

const REWARD_ICONS: { [key: string]: React.FC<{ className?: string }> } = {
    cash: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    gift: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" /></svg>,
    leaf: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    trophy: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>,
    star: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    calendar: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    target: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    shield: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.606 11.955 11.955 0 019 2.606 12.02 12.02 0 00-2.618-9.984z" /></svg>,
    users: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>,
    giftBox: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v10H4V12M2 7l10 5 10-5M12 12V4" /></svg>,
    arrowUp: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
    arrowDown: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
};


// --- MOCK DATA AND SIMULATED API RESPONSES ---

const mockPointsHistory = [
    { month: 'Jan', earned: 12000, redeemed: 4000 }, { month: 'Feb', earned: 15000, redeemed: 5000 },
    { month: 'Mar', earned: 13000, redeemed: 10000 }, { month: 'Apr', earned: 18000, redeemed: 2500 },
    { month: 'May', earned: 22000, redeemed: 7500 }, { month: 'Jun', earned: 25000, redeemed: 12000 },
    { month: 'Jul', earned: 28000, redeemed: 15000 }, { month: 'Aug', earned: 26000, redeemed: 8000 },
];

export const mockAchievements: Achievement[] = [
    { id: 'achv_01', name: 'First Steps', description: 'Redeem your first reward.', icon: REWARD_ICONS.star, unlocked: true, unlockedDate: '2023-04-12' },
    { id: 'achv_02', name: 'Point Collector', description: 'Earn 10,000 points in a single month.', icon: REWARD_ICONS.trophy, unlocked: true, unlockedDate: '2023-06-20' },
    { id: 'achv_03', name: 'Super Saver', description: 'Accumulate over 50,000 points.', icon: REWARD_ICONS.shield, unlocked: false, progress: { current: 32500, total: 50000 } },
    { id: 'achv_04', name: 'Daily Streak', description: 'Log in 7 days in a row.', icon: REWARD_ICONS.calendar, unlocked: false, progress: { current: 4, total: 7 } },
    { id: 'achv_05', name: 'Top Performer', description: 'Reach the top 10 on the weekly leaderboard.', icon: REWARD_ICONS.users, unlocked: false },
    { id: 'achv_06', name: 'Gift Giver', description: 'Gift points to another user.', icon: REWARD_ICONS.giftBox, unlocked: true, unlockedDate: '2023-08-01' },
];

export const mockQuests: Quest[] = [
    { id: 'quest_01', title: 'Daily Check-in', description: 'Just visit the hub to claim your daily bonus.', points: 100, type: 'daily', isCompleted: true, progress: { current: 1, total: 1 } },
    { id: 'quest_02', title: 'Engage & Earn', description: 'Complete 3 platform tasks today.', points: 500, type: 'daily', isCompleted: false, progress: { current: 1, total: 3 } },
    { id: 'quest_03', title: 'Weekly Warrior', description: 'Earn 5,000 points this week.', points: 2000, type: 'weekly', isCompleted: false, progress: { current: 3200, total: 5000 } },
    { id: 'quest_04', title: 'Summer Special', description: 'Redeem any reward from the "Summer Fun" category.', points: 1500, type: 'special', isCompleted: false, progress: { current: 0, total: 1 } },
];

export const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: 'user_001', username: 'CryptoKing', points: 125400, isCurrentUser: false },
    { rank: 2, userId: 'user_002', username: 'DataDiva', points: 119800, isCurrentUser: false },
    { rank: 3, userId: 'user_003', username: 'PixelPilot', points: 112300, isCurrentUser: false },
    { rank: 4, userId: 'user_004', username: 'CodeWizard', points: 105600, isCurrentUser: false },
    { rank: 5, userId: 'user_005', username: 'You', points: 98750, isCurrentUser: true },
    { rank: 6, userId: 'user_006', username: 'LogicLord', points: 95400, isCurrentUser: false },
    { rank: 7, userId: 'user_007', username: 'ByteBard', points: 92100, isCurrentUser: false },
    { rank: 8, userId: 'user_008', username: 'SyntaxSorcerer', points: 88700, isCurrentUser: false },
    { rank: 9, userId: 'user_009', username: 'AlgoAngel', points: 85300, isCurrentUser: false },
    { rank: 10, userId: 'user_010', username: 'ScriptSage', points: 81900, isCurrentUser: false },
];

export const mockPointsTransactions: PointsTransaction[] = [
    { id: 'txn_01', date: '2023-08-15T10:30:00Z', description: 'Completed project "Phoenix"', points: 5000, type: 'earn' },
    { id: 'txn_02', date: '2023-08-15T09:00:00Z', description: 'Redeemed: $10 Gift Card', points: -10000, type: 'redeem' },
    { id: 'txn_03', date: '2023-08-14T14:20:00Z', description: 'Weekly Quest Bonus', points: 2000, type: 'bonus' },
    { id: 'txn_04', date: '2023-08-14T11:00:00Z', description: 'Daily Check-in', points: 100, type: 'earn' },
    { id: 'txn_05', date: '2023-08-13T18:45:00Z', description: 'Gift sent to CodeWizard', points: -500, type: 'gift_sent' },
    { id: 'txn_06', date: '2023-08-12T12:00:00Z', description: 'Completed task "UI Mockups"', points: 1500, type: 'earn' },
    { id: 'txn_07', date: '2023-08-11T16:15:00Z', description: 'Gift received from DataDiva', points: 1000, type: 'gift_received' },
];

export const mockRedemptionHistory: RedemptionHistoryItem[] = [
    { orderId: 'ORD-2023-A5B2', itemId: 'rew_01', itemName: '$10 Gift Card', cost: 10000, redemptionDate: '2023-08-15', status: 'digital_code_sent', digitalCode: 'ABCD-EFGH-IJKL'},
    { orderId: 'ORD-2023-C4D8', itemId: 'rew_04', itemName: 'Company Branded Hoodie', cost: 25000, redemptionDate: '2023-07-22', status: 'delivered', trackingNumber: '1Z9999W99999999999'},
    { orderId: 'ORD-2023-E9F1', itemId: 'rew_03', itemName: 'Donate $5 to Charity', cost: 5000, redemptionDate: '2023-07-10', status: 'delivered' },
];


// --- NEW REUSABLE UI COMPONENTS ---

/**
 * A generic modal component wrapper.
 * @param isOpen - Controls if the modal is visible.
 * @param onClose - Function to call when the modal should be closed.
 * @param title - The title of the modal.
 * @param children - The content of the modal.
 */
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                <div>{children}</div>
            </div>
        </div>
    );
};

/**
 * A styled tab button for navigation within the hub.
 * @param label - The text label for the tab.
 * @param isActive - Whether the tab is currently active.
 * @param onClick - Click handler.
 * @param icon - Optional icon component.
 */
export const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; icon?: React.FC<{ className?: string }> }> = ({ label, isActive, onClick, icon: Icon }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {Icon && <Icon className="w-5 h-5 mr-2" />}
            {label}
        </button>
    );
};

/**
 * A custom progress bar component.
 * @param value - The current value.
 * @param total - The total/max value.
 * @param colorClass - The Tailwind CSS color class for the bar.
 */
export const ProgressBar: React.FC<{ value: number; total: number; colorClass?: string; }> = ({ value, total, colorClass = 'bg-cyan-500' }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

// --- FEATURE-SPECIFIC COMPONENTS ---

/**
 * Displays the user's achievements, separating locked and unlocked.
 */
export const AchievementsSection: React.FC = () => {
    const [achievements] = useState<Achievement[]>(mockAchievements);
    const unlocked = useMemo(() => achievements.filter(a => a.unlocked), [achievements]);
    const locked = useMemo(() => achievements.filter(a => !a.unlocked), [achievements]);

    const AchievementCard = ({ ach }: { ach: Achievement }) => {
        const Icon = ach.icon;
        return (
            <div className={`p-4 rounded-lg bg-gray-800/50 border ${ach.unlocked ? 'border-cyan-500/50' : 'border-gray-700'} flex flex-col items-center text-center transition-all duration-300 ${!ach.unlocked && 'opacity-60'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${ach.unlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-500'}`}>
                    <Icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-white">{ach.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{ach.description}</p>
                {ach.progress && !ach.unlocked && (
                    <div className="w-full mt-3">
                        <ProgressBar value={ach.progress.current} total={ach.progress.total} />
                        <p className="text-xs text-cyan-300 mt-1">{ach.progress.current} / {ach.progress.total}</p>
                    </div>
                )}
                {ach.unlocked && ach.unlockedDate && (
                    <p className="text-xs text-gray-500 mt-2">Unlocked: {ach.unlockedDate}</p>
                )}
            </div>
        );
    };

    return (
        <Card title="Achievements & Badges">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Unlocked ({unlocked.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {unlocked.map(ach => <AchievementCard key={ach.id} ach={ach} />)}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-500 mb-3">Locked ({locked.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {locked.map(ach => <AchievementCard key={ach.id} ach={ach} />)}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Displays daily and weekly quests for users to complete.
 */
export const QuestsSection: React.FC = () => {
    const [quests] = useState<Quest[]>(mockQuests);

    const handleClaim = (questId: string) => {
        // In a real app, this would trigger a mutation to the backend
        console.log(`Claiming reward for quest ${questId}`);
    };

    return (
        <Card title="Daily & Weekly Quests">
            <div className="space-y-4">
                {quests.map(quest => (
                    <div key={quest.id} className="p-4 bg-gray-800/60 rounded-lg flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${quest.type === 'daily' ? 'bg-indigo-500/50 text-indigo-300' : 'bg-teal-500/50 text-teal-300'}`}>
                                    {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
                                </span>
                                <h4 className="font-semibold text-white">{quest.title}</h4>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                            <div className="mt-2 flex items-center space-x-3">
                                <div className="w-1/2">
                                     <ProgressBar value={quest.progress.current} total={quest.progress.total} colorClass="bg-green-500" />
                                </div>
                                <span className="text-xs text-gray-300">{quest.progress.current}/{quest.progress.total}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-lg text-cyan-300">+{quest.points} Points</p>
                            <button
                                onClick={() => handleClaim(quest.id)}
                                disabled={!quest.isCompleted}
                                className="mt-1 px-3 py-1 bg-cyan-600 text-white rounded-md text-sm hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {quest.isCompleted ? 'Claim' : 'In Progress'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

/**
 * Renders the leaderboard with different time scopes.
 */
export const LeaderboardSection: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(mockLeaderboard);
    const [timeScope, setTimeScope] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');

    // Simulate fetching data for different time scopes
    useEffect(() => {
        // This would be an API call in a real app
        const newPoints = timeScope === 'weekly' ? 1 : timeScope === 'monthly' ? 4 : 10;
        const shuffledData = [...mockLeaderboard].sort(() => Math.random() - 0.5);
        setLeaderboardData(
            shuffledData.map((entry, index) => ({
                ...entry,
                rank: index + 1,
                points: Math.round(entry.points * newPoints / 1.5),
            }))
        );
    }, [timeScope]);

    return (
        <Card title="Leaderboard">
            <div className="flex justify-center space-x-2 mb-4">
                <button onClick={() => setTimeScope('weekly')} className={`px-3 py-1 text-sm rounded-md ${timeScope === 'weekly' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Weekly</button>
                <button onClick={() => setTimeScope('monthly')} className={`px-3 py-1 text-sm rounded-md ${timeScope === 'monthly' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Monthly</button>
                <button onClick={() => setTimeScope('all_time')} className={`px-3 py-1 text-sm rounded-md ${timeScope === 'all_time' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>All Time</button>
            </div>
            <div className="space-y-2">
                {leaderboardData.map(entry => (
                    <div key={entry.userId} className={`flex items-center p-3 rounded-lg ${entry.isCurrentUser ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-gray-800'}`}>
                        <div className="w-8 text-center text-lg font-bold text-gray-400">{entry.rank}</div>
                        <div className="flex-1 ml-4">
                            <p className="font-semibold text-white">{entry.username}</p>
                        </div>
                        <div className="font-mono text-cyan-300">{entry.points.toLocaleString()} pts</div>
                    </div>
                ))}
            </div>
        </Card>
    );
};


/**
 * Displays a detailed log of points transactions.
 */
export const PointsHistorySection: React.FC = () => {
    const [transactions] = useState<PointsTransaction[]>(mockPointsTransactions);
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const paginatedTransactions = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return transactions.slice(start, start + itemsPerPage);
    }, [transactions, page]);
    
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const getTransactionIcon = (type: PointsTransaction['type']) => {
        switch (type) {
            case 'earn': return <div className="bg-green-500/20 text-green-400 rounded-full p-2"><REWARD_ICONS.arrowUp className="w-5 h-5" /></div>;
            case 'redeem': return <div className="bg-red-500/20 text-red-400 rounded-full p-2"><REWARD_ICONS.arrowDown className="w-5 h-5" /></div>;
            case 'bonus': return <div className="bg-yellow-500/20 text-yellow-400 rounded-full p-2"><REWARD_ICONS.star className="w-5 h-5" /></div>;
            case 'gift_sent': return <div className="bg-purple-500/20 text-purple-400 rounded-full p-2"><REWARD_ICONS.giftBox className="w-5 h-5" /></div>;
            case 'gift_received': return <div className="bg-blue-500/20 text-blue-400 rounded-full p-2"><REWARD_ICONS.giftBox className="w-5 h-5" /></div>;
            default: return <div className="bg-gray-500/20 text-gray-400 rounded-full p-2"><REWARD_ICONS.cash className="w-5 h-5" /></div>;
        }
    };
    
    return (
        <Card title="Detailed Points History">
            <div className="space-y-3">
                {paginatedTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="mr-4">
                            {getTransactionIcon(tx.type)}
                        </div>
                        <div className="flex-grow">
                            <p className="text-white font-medium">{tx.description}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                        </div>
                        <p className={`font-mono text-lg ${tx.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
             <div className="flex justify-between items-center mt-6">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm disabled:opacity-50">Previous</button>
                <span className="text-gray-400">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm disabled:opacity-50">Next</button>
            </div>
        </Card>
    );
};

/**
 * Displays the user's redemption history.
 */
export const RedemptionHistorySection: React.FC = () => {
    const [history] = useState<RedemptionHistoryItem[]>(mockRedemptionHistory);

    const getStatusChip = (status: RedemptionHistoryItem['status']) => {
        const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
        switch (status) {
            case 'processing': return <span className={`${baseClasses} bg-yellow-500/50 text-yellow-300`}>Processing</span>;
            case 'shipped': return <span className={`${baseClasses} bg-blue-500/50 text-blue-300`}>Shipped</span>;
            case 'delivered': return <span className={`${baseClasses} bg-green-500/50 text-green-300`}>Delivered</span>;
            case 'digital_code_sent': return <span className={`${baseClasses} bg-cyan-500/50 text-cyan-300`}>Code Sent</span>;
            case 'cancelled': return <span className={`${baseClasses} bg-red-500/50 text-red-300`}>Cancelled</span>;
        }
    };
    
    return (
        <Card title="My Redemptions">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Item</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Cost</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.orderId} className="bg-gray-800 border-b border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.itemName}</th>
                                <td className="px-6 py-4">{item.redemptionDate}</td>
                                <td className="px-6 py-4 font-mono">{item.cost.toLocaleString()} pts</td>
                                <td className="px-6 py-4">{getStatusChip(item.status)}</td>
                                <td className="px-6 py-4">
                                    {item.trackingNumber && <a href="#" className="text-cyan-400 hover:underline">Track</a>}
                                    {item.digitalCode && <a href="#" className="text-cyan-400 hover:underline">View Code</a>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

/**
 * Enhanced Redeem section with filtering and sorting.
 */
export const RedeemSection: React.FC<{
    rewardItems: RewardItem[];
    handleRedeem: (item: RewardItem) => void;
    userPoints: number;
}> = ({ rewardItems, handleRedeem, userPoints }) => {
    const [category, setCategory] = useState<RewardCategory>('all');
    const [sortBy, setSortBy] = useState<'cost_asc' | 'cost_desc' | 'name_asc'>('cost_asc');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAndSortedItems = useMemo(() => {
        return rewardItems
            .filter(item => category === 'all' || item.category === category)
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                switch (sortBy) {
                    case 'cost_asc': return a.cost - b.cost;
                    case 'cost_desc': return b.cost - a.cost;
                    case 'name_asc': return a.name.localeCompare(b.name);
                    default: return 0;
                }
            });
    }, [rewardItems, category, sortBy, searchQuery]);

    const categories: { id: RewardCategory; name: string }[] = [
        { id: 'all', name: 'All' },
        { id: 'gift_card', name: 'Gift Cards' },
        { id: 'merchandise', name: 'Merchandise' },
        { id: 'donation', name: 'Donations' },
        { id: 'digital', name: 'Digital' },
    ];
    
    return (
        <Card title="Redeem Your Points">
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setCategory(cat.id)} className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${category === cat.id ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search rewards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="cost_asc">Cost: Low to High</option>
                        <option value="cost_desc">Cost: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedItems.map(item => {
                    const Icon = REWARD_ICONS[item.iconName];
                    const canAfford = userPoints >= item.cost;
                    return (
                        <Card key={item.id} className={`flex flex-col text-center transition-opacity duration-300 ${!canAfford && 'opacity-50'}`}>
                            <div className="flex-grow">
                                <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-300">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mt-4">{item.name}</h4>
                                <p className="text-sm text-gray-400 mt-2 h-10">{item.description}</p>
                            </div>
                            <div className="mt-6">
                                <p className="font-mono text-xl text-cyan-300 mb-4">{item.cost.toLocaleString()} Points</p>
                                <button onClick={() => handleRedeem(item)} disabled={!canAfford} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    {canAfford ? 'Redeem' : 'Not Enough Points'}
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>
            {filteredAndSortedItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>No rewards match your criteria.</p>
                </div>
            )}
        </Card>
    );
};

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f97316', '#ef4444'];
/**
 * Advanced analytics dashboard for user points.
 */
export const AnalyticsDashboardSection: React.FC = () => {
    const pointsByCategory = [
        { name: 'Project Completion', value: 45000 },
        { name: 'Task Bonuses', value: 22000 },
        { name: 'Quests', value: 15000 },
        { name: 'Gifts Received', value: 5000 },
        { name: 'Other', value: 8000 },
    ];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card title="Points Earned Over Time" className="lg:col-span-3">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockPointsHistory}>
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Bar dataKey="earned" stackId="a" fill="#06b6d4" name="Earned" />
                        <Bar dataKey="redeemed" stackId="a" fill="#ef4444" name="Redeemed" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Earnings Breakdown" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                         <Pie
                            data={pointsByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelStyle={{fontSize: "10px", fill: "#cbd5e1"}}
                        >
                            {pointsByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const RewardsHubView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("RewardsHubView must be within a DataProvider.");
    
    const { gamification, rewardPoints, rewardItems, redeemReward } = context;
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'redeem' | 'achievements' | 'quests' | 'leaderboard' | 'history'>('overview');
    
    const handleRedeem = useCallback((item: RewardItem) => {
        const success = redeemReward(item);
        if (success) {
            setFeedback({ type: 'success', message: `Successfully redeemed ${item.name}!`});
            // TODO: Invalidate relevant data caches (e.g., points, redemption history)
        } else {
            setFeedback({ type: 'error', message: "Not enough points to redeem this item."});
        }
        setTimeout(() => setFeedback(null), 5000);
    }, [redeemReward]);

    const TABS = [
        { id: 'overview', label: 'Overview' },
        { id: 'redeem', label: 'Redeem Points' },
        { id: 'quests', label: 'Quests' },
        { id: 'achievements', label: 'Achievements' },
        { id: 'leaderboard', label: 'Leaderboard' },
        { id: 'history', label: 'History' },
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Your Points">
                                <p className="text-6xl font-bold text-center text-white my-4">{rewardPoints.balance.toLocaleString()}</p>
                                <p className="text-center text-gray-400">Points</p>
                            </Card>
                            <Card title="Your Level" className="lg:col-span-2">
                                <div className="flex flex-col justify-center h-full">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-2xl font-semibold text-white">{gamification.levelName}</h3>
                                        <p className="text-lg text-gray-400">Level {gamification.level}</p>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4 mt-4">
                                        <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-4 rounded-full text-right pr-2 text-xs text-white flex items-center justify-center" style={{ width: `${gamification.progress}%` }}>
                                            <span>{gamification.progress.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 text-right">
                                        {((gamification.nextLevelXp - gamification.currentXp) * (100 / gamification.progress)).toLocaleString()} total XP to next level
                                    </p>
                                </div>
                            </Card>
                        </div>
                        <AnalyticsDashboardSection />
                    </div>
                );
            case 'redeem':
                return <RedeemSection rewardItems={rewardItems} handleRedeem={handleRedeem} userPoints={rewardPoints.balance} />;
            case 'achievements':
                return <AchievementsSection />;
            case 'quests':
                return <QuestsSection />;
            case 'leaderboard':
                return <LeaderboardSection />;
            case 'history':
                return (
                    <div className="space-y-6">
                        <PointsHistorySection />
                        <RedemptionHistorySection />
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-bold text-white tracking-wider">Rewards Hub</h2>
                <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-300">
                    <span>Your Points:</span>
                    <span className="font-mono font-bold text-lg text-cyan-300">{rewardPoints.balance.toLocaleString()}</span>
                </div>
            </div>

            {feedback && (
                <div className={`p-4 rounded-lg text-white text-sm ${feedback.type === 'success' ? 'bg-green-500/50' : 'bg-red-500/50'} transition-opacity duration-300`}>
                    {feedback.message}
                </div>
            )}
            
            <div className="flex space-x-2 border-b border-gray-700 pb-2 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <TabButton 
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                    />
                ))}
            </div>

            <div>
                {renderActiveTabContent()}
            </div>
        </div>
    );
};

export default RewardsHubView;