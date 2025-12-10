import { MdDashboard } from 'react-icons/md';

export default function Loading() {
    return (
        <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse'>
                <MdDashboard className='h-8 w-8 text-blue-600' />
            </div>
            <p className='text-gray-500'>Loading...</p>
        </div>
    );
}
