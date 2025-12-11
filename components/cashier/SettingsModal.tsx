'use client';

import { MdSettings } from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { useTextSize, TextSize, TEXT_SIZE_MAP } from '@/lib/context/TextSizeContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; description: string }[] = [
    { value: 'normal', label: 'Normal', description: '100% - Default size' },
    { value: 'large', label: 'Large', description: '110% - Slightly larger' },
    { value: 'xl', label: 'Extra Large', description: '125% - Much larger' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { textSize, setTextSize } = useTextSize();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Settings"
            headerIcon={<MdSettings size={24} />}
            headerClassName="bg-gray-700 border-gray-600 text-white"
            maxWidth="md"
        >
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Accessibility
                    </h3>

                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Text Size
                        </label>
                        <div className="space-y-2">
                            {TEXT_SIZE_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${textSize === option.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="textSize"
                                        value={option.value}
                                        checked={textSize === option.value}
                                        onChange={() => setTextSize(option.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-sm text-gray-500">{option.description}</div>
                                    </div>
                                    <div
                                        className="text-gray-500 font-mono text-sm"
                                        style={{ fontSize: TEXT_SIZE_MAP[option.value] }}
                                    >
                                        Aa
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Changes are saved automatically and will persist across sessions.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
