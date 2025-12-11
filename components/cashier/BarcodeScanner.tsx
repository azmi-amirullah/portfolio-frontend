import { useZxing } from "react-zxing";
import { MdClose } from "react-icons/md";
import { Button } from "@/components/ui/Button";

interface BarcodeScannerProps {
    onResult: (result: string) => void;
    onClose: () => void;
}

export const BarcodeScanner = ({ onResult, onClose }: BarcodeScannerProps) => {
    const { ref } = useZxing({
        onDecodeResult: (result) => {
            onResult(result.getText());
        },
    });

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-3/4 bg-black rounded-2xl overflow-hidden border border-gray-700">
                <video ref={ref} className="w-full h-full object-cover" />

                {/* Overlay for scanning area guidance */}
                <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>

                <Button
                    onClick={onClose}
                    variant="ghost"
                    className="absolute top-0 right-0 text-white hover:text-white/80 hover:bg-transparent rounded-full p-2 h-10 w-10 flex items-center justify-center"
                >
                    <MdClose size={24} />
                </Button>

                <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 bg-black/50 py-2 mx-8 rounded-full">
                    Point camera at a barcode
                </div>
            </div>
        </div>
    );
};
