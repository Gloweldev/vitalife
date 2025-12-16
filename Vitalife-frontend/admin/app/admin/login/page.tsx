'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        try {
            await signIn(email, password);
            toast.success('¡Bienvenido de vuelta!');
        } catch (error: any) {
            toast.error('Error de autenticación', {
                description: 'Verifica tus credenciales e intenta de nuevo',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
            {/* Animated Blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Glass Card */}
                    <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        {/* Gradient Overlay */}
                        <div className="bg-gradient-to-br from-white/50 to-transparent p-8">
                            {/* Logo */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                                    Club Vitalife
                                </h1>
                                <p className="text-gray-600">Panel de Administración</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="pl-11 bg-white/90"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <Label htmlFor="password">Contraseña</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-11 bg-white/90"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Iniciando sesión...' : 'Entrar'}
                                </Button>
                            </form>

                            {/* Security Badge */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Conexión segura
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
