import { Toaster } from 'sonner';
import ProductWizard from '@/components/admin/ProductWizard';

export default function NewProductPage() {
    return (
        <>
            <Toaster position="top-right" richColors />
            <ProductWizard mode="create" />
        </>
    );
}
